const express = require('express');
const router = express.Router();
const TradeRoute = require('../models/TradeRoute');
const StarSystem = require('../models/StarSystem');

// @route   GET /api/traderoutes
// @desc    Get all trade routes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const tradeRoutes = await TradeRoute.find()
      .populate('sourceSystem destinationSystem waypoints')
      .sort({ profit: -1 });
    res.json(tradeRoutes);
  } catch (error) {
    console.error('Error fetching trade routes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/traderoutes/optimize
// @desc    Optimize trade routes between two systems
// @access  Public
router.post('/optimize', async (req, res) => {
  try {
    const { sourceId, destinationId, maxWaypoints = 2 } = req.body;
    
    if (!sourceId || !destinationId) {
      return res.status(400).json({ message: 'Source and destination IDs are required' });
    }

    const sourceSystem = await StarSystem.findById(sourceId);
    const destinationSystem = await StarSystem.findById(destinationId);
    
    if (!sourceSystem || !destinationSystem) {
      return res.status(404).json({ message: 'Source or destination system not found' });
    }

    // Get all systems for route optimization
    const allSystems = await StarSystem.find();
    
    // Calculate direct route
    const directRoute = calculateDirectRoute(sourceSystem, destinationSystem);
    
    // Calculate hub routes (via trade hubs)
    const hubRoutes = await calculateHubRoutes(sourceSystem, destinationSystem, allSystems);
    
    // Calculate multi-hop routes
    const multiHopRoutes = await calculateMultiHopRoutes(
      sourceSystem, 
      destinationSystem, 
      allSystems, 
      maxWaypoints
    );

    // Combine all routes and sort by profit
    const allRoutes = [directRoute, ...hubRoutes, ...multiHopRoutes]
      .filter(route => route !== null)
      .sort((a, b) => b.profit - a.profit);

    // Mark the best route as optimal
    if (allRoutes.length > 0) {
      allRoutes[0].isOptimal = true;
    }

    // Save routes to database
    const savedRoutes = await TradeRoute.insertMany(allRoutes);

    res.json({
      routes: savedRoutes,
      totalRoutes: savedRoutes.length,
      optimalRoute: savedRoutes[0] || null
    });
  } catch (error) {
    console.error('Error optimizing trade routes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate direct route
function calculateDirectRoute(source, destination) {
  const distance = source.calculateDistance(destination);
  const fuelCost = distance * 0.1; // Base fuel cost per unit distance
  const tradeValue = Math.min(source.calculateTradeValue(), destination.calculateTradeValue());
  const profit = tradeValue - fuelCost;

  return {
    name: `${source.name} → ${destination.name}`,
    sourceSystem: source._id,
    destinationSystem: destination._id,
    waypoints: [],
    distance,
    fuelCost,
    tradeValue,
    profit,
    routeType: 'direct',
    cargo: calculateOptimalCargo(source, destination)
  };
}

// Helper function to calculate hub routes
async function calculateHubRoutes(source, destination, allSystems) {
  const tradeHubs = allSystems.filter(system => system.isTradeHub);
  const routes = [];

  for (const hub of tradeHubs) {
    if (hub._id.toString() === source._id.toString() || 
        hub._id.toString() === destination._id.toString()) {
      continue;
    }

    const distance1 = source.calculateDistance(hub);
    const distance2 = hub.calculateDistance(destination);
    const totalDistance = distance1 + distance2;
    
    const fuelCost = totalDistance * 0.08; // Slightly cheaper fuel at hubs
    const tradeValue = Math.min(
      source.calculateTradeValue(), 
      hub.calculateTradeValue(), 
      destination.calculateTradeValue()
    );
    const profit = tradeValue - fuelCost;

    routes.push({
      name: `${source.name} → ${hub.name} → ${destination.name}`,
      sourceSystem: source._id,
      destinationSystem: destination._id,
      waypoints: [hub._id],
      distance: totalDistance,
      fuelCost,
      tradeValue,
      profit,
      routeType: 'hub',
      cargo: calculateOptimalCargo(source, destination, hub)
    });
  }

  return routes;
}

// Helper function to calculate multi-hop routes
async function calculateMultiHopRoutes(source, destination, allSystems, maxWaypoints) {
  const routes = [];
  const otherSystems = allSystems.filter(system => 
    system._id.toString() !== source._id.toString() && 
    system._id.toString() !== destination._id.toString()
  );

  // Generate combinations of waypoints
  const waypointCombinations = generateCombinations(otherSystems, maxWaypoints);
  
  for (const waypoints of waypointCombinations) {
    const totalDistance = calculateMultiHopDistance(source, destination, waypoints);
    const fuelCost = totalDistance * 0.12; // Higher fuel cost for complex routes
    const tradeValue = Math.min(
      source.calculateTradeValue(),
      ...waypoints.map(wp => wp.calculateTradeValue()),
      destination.calculateTradeValue()
    );
    const profit = tradeValue - fuelCost;

    if (profit > 0) {
      routes.push({
        name: `${source.name} → ${waypoints.map(wp => wp.name).join(' → ')} → ${destination.name}`,
        sourceSystem: source._id,
        destinationSystem: destination._id,
        waypoints: waypoints.map(wp => wp._id),
        distance: totalDistance,
        fuelCost,
        tradeValue,
        profit,
        routeType: 'multi-hop',
        cargo: calculateOptimalCargo(source, destination, ...waypoints)
      });
    }
  }

  return routes;
}

// Helper function to calculate optimal cargo
function calculateOptimalCargo(source, destination, ...waypoints) {
  const cargo = [];
  
  // Simple cargo calculation based on resource availability
  for (const resource of source.resources) {
    if (resource.availability > 50) { // Only trade abundant resources
      cargo.push({
        resourceName: resource.name,
        amount: Math.floor(resource.availability / 10),
        price: resource.price
      });
    }
  }
  
  return cargo;
}

// Helper function to calculate multi-hop distance
function calculateMultiHopDistance(source, destination, waypoints) {
  let totalDistance = 0;
  let current = source;
  
  for (const waypoint of waypoints) {
    totalDistance += current.calculateDistance(waypoint);
    current = waypoint;
  }
  
  totalDistance += current.calculateDistance(destination);
  return totalDistance;
}

// Helper function to generate combinations
function generateCombinations(systems, maxLength) {
  const combinations = [];
  
  function generate(current, remaining, length) {
    if (length === 0 || remaining.length === 0) {
      if (current.length > 0) {
        combinations.push([...current]);
      }
      return;
    }
    
    for (let i = 0; i < remaining.length; i++) {
      current.push(remaining[i]);
      generate(current, remaining.slice(i + 1), length - 1);
      current.pop();
    }
  }
  
  for (let length = 1; length <= maxLength; length++) {
    generate([], systems, length);
  }
  
  return combinations;
}

// @route   DELETE /api/traderoutes/:id
// @desc    Delete trade route
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const tradeRoute = await TradeRoute.findByIdAndDelete(req.params.id);
    if (!tradeRoute) {
      return res.status(404).json({ message: 'Trade route not found' });
    }
    res.json({ message: 'Trade route deleted successfully' });
  } catch (error) {
    console.error('Error deleting trade route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
