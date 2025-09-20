import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Route, 
  Zap, 
  DollarSign, 
  Fuel, 
  Clock,
  TrendingUp,
  Target,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Package,
  Settings
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { calculateOptimalRoute, generateAllRoutes, calculateRouteEfficiency } from '../utils/knapsackOptimizer';
import toast from 'react-hot-toast';

const RouteOptimizer = ({ starSystems, tradeRoutes, onUpdate, onOptimizedRoutesUpdate, selectedFuel, fuelTypes }) => {
  const [sourceSystem, setSourceSystem] = useState('');
  const [destinationSystem, setDestinationSystem] = useState('');
  const [maxWaypoints, setMaxWaypoints] = useState(2);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedRoutes, setOptimizedRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedResources, setSelectedResources] = useState({});
  const [showResourceSelection, setShowResourceSelection] = useState(false);

  const handleOptimize = async () => {
    if (!sourceSystem || !destinationSystem) {
      toast.error('Please select both source and destination systems');
      return;
    }

    if (sourceSystem === destinationSystem) {
      toast.error('Source and destination systems must be different');
      return;
    }

    if (!selectedFuel) {
      toast.error('Please select a fuel type');
      return;
    }

    setIsOptimizing(true);
    try {
      const source = starSystems.find(s => s._id === sourceSystem);
      const destination = starSystems.find(s => s._id === destinationSystem);
      
      if (!source || !destination) {
        toast.error('Source or destination system not found');
        return;
      }

      // Generate all possible routes
      const allRoutes = generateAllRoutes(source, destination, starSystems, maxWaypoints);
      
      // Calculate efficiency for each route using knapsack optimization
      const optimizedRoutes = allRoutes.map(route => {
        const routeEfficiency = calculateRouteEfficiency(route, selectedFuel);
        return {
          ...routeEfficiency,
          name: route.systems.map(s => s.name).join(' → '),
          sourceSystem: source._id,
          destinationSystem: destination._id,
          waypoints: route.waypoints.map(w => w._id),
          routeType: route.type,
          isOptimal: false
        };
      });

      // Sort by profit and mark the best as optimal
      optimizedRoutes.sort((a, b) => b.profit - a.profit);
      if (optimizedRoutes.length > 0) {
        optimizedRoutes[0].isOptimal = true;
      }

      setOptimizedRoutes(optimizedRoutes);
      setSelectedRoute(optimizedRoutes[0] || null);
      setShowResourceSelection(true);
      
      // Pass optimized routes to parent for map display
      if (onOptimizedRoutesUpdate) {
        onOptimizedRoutesUpdate(optimizedRoutes);
      }
      
      toast.success(`Found ${optimizedRoutes.length} optimized routes!`);
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toFixed(2) || '0';
  };

  const getRouteTypeColor = (type) => {
    switch (type) {
      case 'direct': return 'text-planet-green';
      case 'hub': return 'text-star-gold';
      case 'multi-hop': return 'text-cosmic-indigo';
      default: return 'text-asteroid-gray';
    }
  };

  const getRouteTypeIcon = (type) => {
    switch (type) {
      case 'direct': return <ArrowRight className="w-4 h-4" />;
      case 'hub': return <Target className="w-4 h-4" />;
      case 'multi-hop': return <Route className="w-4 h-4" />;
      default: return <Route className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-space font-bold text-white">Route Optimizer</h1>
        <p className="text-asteroid-gray">Find the most profitable trade routes between star systems</p>
      </div>

      {/* Optimization Controls */}
      <div className="glass-effect rounded-xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Search className="w-5 h-5 mr-2 text-nebula-purple" />
          Route Configuration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Source System</label>
            <select
              value={sourceSystem}
              onChange={(e) => setSourceSystem(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-nebula-purple focus:outline-none"
            >
              <option value="">Select source system</option>
              {starSystems.map((system) => (
                <option key={system._id} value={system._id}>
                  {system.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Destination System</label>
            <select
              value={destinationSystem}
              onChange={(e) => setDestinationSystem(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-nebula-purple focus:outline-none"
            >
              <option value="">Select destination system</option>
              {starSystems.map((system) => (
                <option key={system._id} value={system._id}>
                  {system.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Max Waypoints</label>
            <select
              value={maxWaypoints}
              onChange={(e) => setMaxWaypoints(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-nebula-purple focus:outline-none"
            >
              <option value={0}>Direct only</option>
              <option value={1}>1 waypoint</option>
              <option value={2}>2 waypoints</option>
              <option value={3}>3 waypoints</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleOptimize}
              disabled={isOptimizing || !sourceSystem || !destinationSystem}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-nebula-purple text-white rounded-lg hover:bg-nebula-purple/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isOptimizing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Optimizing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Optimize Routes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Resource Selection */}
      {showResourceSelection && sourceSystem && (
        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-planet-green" />
            Resource Selection for Trade
          </h3>
          
          {(() => {
            const source = starSystems.find(s => s._id === sourceSystem);
            if (!source || !source.resources) return null;
            
            return (
              <div className="space-y-4">
                <div className="text-sm text-asteroid-gray mb-4">
                  Select resources available at <span className="text-white font-medium">{source.name}</span> for trade
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {source.resources.map((resource, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{resource.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-star-gold font-semibold">${resource.price}</span>
                          <span className="text-asteroid-gray text-sm">per unit</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-asteroid-gray mb-3">
                        Availability: {resource.availability}%
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`resource-${index}`}
                          checked={selectedResources[resource.name] || false}
                          onChange={(e) => {
                            setSelectedResources(prev => ({
                              ...prev,
                              [resource.name]: e.target.checked
                            }));
                          }}
                          className="w-4 h-4 text-nebula-purple bg-white/5 border-white/10 rounded focus:ring-nebula-purple"
                        />
                        <label htmlFor={`resource-${index}`} className="text-white text-sm cursor-pointer">
                          Include in trade
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      const selectedCount = Object.values(selectedResources).filter(Boolean).length;
                      toast.success(`Selected ${selectedCount} resources for trade optimization`);
                    }}
                    className="px-4 py-2 bg-planet-green text-white rounded-lg hover:bg-planet-green/80 transition-colors"
                  >
                    Confirm Resource Selection
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Results */}
      {optimizedRoutes.length > 0 && (
        <div className="space-y-6">
          {/* Optimal Route Highlight */}
          {selectedRoute && (
            <div className="glass-effect rounded-xl p-6 border border-star-gold/30 bg-star-gold/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-star-gold flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Optimal Route
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-star-gold text-sm">Best Profit</span>
                  <div className="w-2 h-2 bg-star-gold rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-asteroid-gray text-sm">Route</p>
                  <p className="text-white font-medium">{selectedRoute.name}</p>
                </div>
                <div className="text-center">
                  <p className="text-asteroid-gray text-sm">Distance</p>
                  <p className="text-white font-medium">{formatNumber(selectedRoute.totalDistance)} LY</p>
                </div>
                <div className="text-center">
                  <p className="text-asteroid-gray text-sm">Fuel Used</p>
                  <p className="text-red-400 font-medium">{selectedRoute.fuelType} ({selectedRoute.fuelEfficiency}%)</p>
                </div>
                <div className="text-center">
                  <p className="text-asteroid-gray text-sm">Fuel Cost</p>
                  <p className="text-red-400 font-medium">${formatNumber(selectedRoute.totalFuelCost)}</p>
                </div>
                <div className="text-center">
                  <p className="text-asteroid-gray text-sm">Trade Value</p>
                  <p className="text-planet-green font-medium">${formatNumber(selectedRoute.totalTradeValue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-asteroid-gray text-sm">Profit</p>
                  <p className="text-star-gold font-bold text-lg">${formatNumber(selectedRoute.profit)}</p>
                </div>
                <div className="text-center">
                  <p className="text-asteroid-gray text-sm">Efficiency</p>
                  <p className="text-cosmic-indigo font-medium">{(selectedRoute.efficiency * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}

          {/* All Routes */}
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Route className="w-5 h-5 mr-2 text-cosmic-indigo" />
              All Optimized Routes ({optimizedRoutes.length})
            </h3>
            
            <div className="space-y-4">
              {optimizedRoutes.map((route, index) => (
                <div
                  key={route._id || index}
                  className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                    selectedRoute?._id === route._id
                      ? 'border-star-gold/50 bg-star-gold/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedRoute(route)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center space-x-1 ${getRouteTypeColor(route.routeType)}`}>
                        {getRouteTypeIcon(route.routeType)}
                        <span className="text-sm font-medium capitalize">{route.routeType}</span>
                      </div>
                      <h4 className="text-white font-medium">{route.name}</h4>
                      {route.isOptimal && (
                        <div className="px-2 py-1 bg-star-gold/20 text-star-gold text-xs rounded-full">
                          Optimal
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-star-gold font-bold text-lg">${formatNumber(route.profit)}</p>
                      <p className="text-asteroid-gray text-sm">Profit</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-asteroid-gray">Distance</p>
                      <p className="text-white font-medium">{formatNumber(route.distance)} LY</p>
                    </div>
                    <div>
                      <p className="text-asteroid-gray">Fuel Cost</p>
                      <p className="text-red-400 font-medium">${formatNumber(route.fuelCost)}</p>
                    </div>
                    <div>
                      <p className="text-asteroid-gray">Trade Value</p>
                      <p className="text-planet-green font-medium">${formatNumber(route.tradeValue)}</p>
                    </div>
                    <div>
                      <p className="text-asteroid-gray">Efficiency</p>
                      <p className="text-cosmic-indigo font-medium">
                        {route.fuelCost > 0 ? (route.tradeValue / route.fuelCost).toFixed(2) : '∞'}
                      </p>
                    </div>
                  </div>

                  {route.cargo && route.cargo.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-asteroid-gray text-sm mb-2">Cargo:</p>
                      <div className="flex flex-wrap gap-2">
                        {route.cargo.map((item, idx) => (
                          <div key={idx} className="px-2 py-1 bg-white/10 rounded text-xs text-white">
                            {item.resourceName}: {item.amount} @ ${formatNumber(item.price)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Existing Routes */}
      {tradeRoutes.length > 0 && optimizedRoutes.length === 0 && (
        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-asteroid-gray" />
            Existing Trade Routes ({tradeRoutes.length})
          </h3>
          
          <div className="space-y-4">
            {tradeRoutes.slice(0, 5).map((route, index) => (
              <div key={route._id || index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{route.name}</h4>
                    <p className="text-asteroid-gray text-sm">
                      {route.routeType} • {formatNumber(route.distance)} LY
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-star-gold font-semibold">${formatNumber(route.profit)}</p>
                    <p className="text-asteroid-gray text-sm">Profit</p>
                  </div>
                </div>
              </div>
            ))}
            {tradeRoutes.length > 5 && (
              <p className="text-asteroid-gray text-center text-sm">
                And {tradeRoutes.length - 5} more routes...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tradeRoutes.length === 0 && optimizedRoutes.length === 0 && (
        <div className="text-center py-12">
          <Route className="w-16 h-16 text-asteroid-gray mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Trade Routes</h3>
          <p className="text-asteroid-gray mb-6">Select source and destination systems to optimize trade routes</p>
        </div>
      )}
    </div>
  );
};

export default RouteOptimizer;
