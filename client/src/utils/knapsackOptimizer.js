// Knapsack algorithm for optimizing resource transport based on fuel efficiency
export const knapsackOptimizer = (resources, fuelEfficiency, maxCapacity = 100) => {
  const n = resources.length;
  
  // Create a 2D array for dynamic programming
  const dp = Array(n + 1).fill().map(() => Array(maxCapacity + 1).fill(0));
  const selected = Array(n + 1).fill().map(() => Array(maxCapacity + 1).fill(false));
  
  // Calculate efficiency score for each resource
  const resourcesWithScore = resources.map(resource => ({
    ...resource,
    efficiencyScore: (resource.availability * resource.price) / (resource.weight || 1),
    profitPerUnit: resource.availability * resource.price
  }));
  
  // Sort by efficiency score (descending)
  resourcesWithScore.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
  
  // Fill the DP table
  for (let i = 1; i <= n; i++) {
    const resource = resourcesWithScore[i - 1];
    const weight = Math.ceil(resource.weight || 1);
    const value = resource.profitPerUnit * (fuelEfficiency / 100);
    
    for (let w = 0; w <= maxCapacity; w++) {
      if (weight <= w) {
        const takeValue = dp[i - 1][w - weight] + value;
        if (takeValue > dp[i - 1][w]) {
          dp[i][w] = takeValue;
          selected[i][w] = true;
        } else {
          dp[i][w] = dp[i - 1][w];
        }
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  
  // Backtrack to find selected resources
  const selectedResources = [];
  let w = maxCapacity;
  
  for (let i = n; i > 0; i--) {
    if (selected[i][w]) {
      const resource = resourcesWithScore[i - 1];
      const weight = Math.ceil(resource.weight || 1);
      selectedResources.push({
        ...resource,
        selectedAmount: Math.min(resource.availability, Math.floor(maxCapacity / weight))
      });
      w -= weight;
    }
  }
  
  return {
    selectedResources,
    totalValue: dp[n][maxCapacity],
    totalWeight: maxCapacity - w,
    efficiency: fuelEfficiency
  };
};

// Calculate optimal trade route considering fuel efficiency
export const calculateOptimalRoute = (sourceSystem, destinationSystem, fuelType, availableResources) => {
  const distance = calculateDistance(sourceSystem.coordinates, destinationSystem.coordinates);
  
  // Calculate fuel consumption based on distance and efficiency
  const baseFuelConsumption = distance * 0.1; // Base consumption per light year
  const fuelConsumption = baseFuelConsumption / (fuelType.efficiency / 100);
  const fuelCost = fuelConsumption * fuelType.cost;
  
  // Use knapsack to optimize resource selection
  const optimization = knapsackOptimizer(availableResources, fuelType.efficiency);
  
  // Calculate total trade value
  const totalTradeValue = optimization.selectedResources.reduce((sum, resource) => 
    sum + (resource.selectedAmount * resource.price), 0
  );
  
  const profit = totalTradeValue - fuelCost;
  
  return {
    distance,
    fuelConsumption,
    fuelCost,
    fuelType: fuelType.name,
    fuelEfficiency: fuelType.efficiency,
    selectedResources: optimization.selectedResources,
    totalTradeValue,
    profit,
    efficiency: profit / fuelCost || 0
  };
};

// Calculate distance between two coordinate points
export const calculateDistance = (coord1, coord2) => {
  const dx = coord1.x - coord2.x;
  const dy = coord1.y - coord2.y;
  const dz = coord1.z - coord2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

// Generate all possible routes between source and destination
export const generateAllRoutes = (sourceSystem, destinationSystem, allSystems, maxWaypoints = 2) => {
  const routes = [];
  
  // Direct route
  routes.push({
    type: 'direct',
    systems: [sourceSystem, destinationSystem],
    waypoints: []
  });
  
  // Routes with waypoints
  const otherSystems = allSystems.filter(system => 
    system._id !== sourceSystem._id && system._id !== destinationSystem._id
  );
  
  // Generate combinations of waypoints
  for (let i = 1; i <= Math.min(maxWaypoints, otherSystems.length); i++) {
    const combinations = getCombinations(otherSystems, i);
    combinations.forEach(waypoints => {
      routes.push({
        type: 'multi-hop',
        systems: [sourceSystem, ...waypoints, destinationSystem],
        waypoints: waypoints
      });
    });
  }
  
  return routes;
};

// Get all combinations of k elements from array
const getCombinations = (arr, k) => {
  if (k === 1) return arr.map(item => [item]);
  if (k === arr.length) return [arr];
  
  const combinations = [];
  for (let i = 0; i <= arr.length - k; i++) {
    const head = arr[i];
    const tailCombinations = getCombinations(arr.slice(i + 1), k - 1);
    tailCombinations.forEach(tail => {
      combinations.push([head, ...tail]);
    });
  }
  return combinations;
};

// Calculate route efficiency score
export const calculateRouteEfficiency = (route, fuelType) => {
  let totalDistance = 0;
  let totalFuelCost = 0;
  let totalTradeValue = 0;
  
  for (let i = 0; i < route.systems.length - 1; i++) {
    const current = route.systems[i];
    const next = route.systems[i + 1];
    const distance = calculateDistance(current.coordinates, next.coordinates);
    totalDistance += distance;
    
    const fuelConsumption = (distance * 0.1) / (fuelType.efficiency / 100);
    totalFuelCost += fuelConsumption * fuelType.cost;
  }
  
  // Calculate trade value based on available resources
  const sourceResources = route.systems[0].resources || [];
  const optimization = knapsackOptimizer(sourceResources, fuelType.efficiency);
  totalTradeValue = optimization.totalValue;
  
  const profit = totalTradeValue - totalFuelCost;
  const efficiency = profit / totalFuelCost || 0;
  
  return {
    ...route,
    totalDistance,
    totalFuelCost,
    totalTradeValue,
    profit,
    efficiency,
    fuelType: fuelType.name,
    fuelEfficiency: fuelType.efficiency
  };
};
