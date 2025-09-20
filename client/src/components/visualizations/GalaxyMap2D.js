import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

const GalaxyMap2D = ({ starSystems, tradeRoutes, optimizedRoutes = [] }) => {
  const svgRef = useRef();
  const [zoom, setZoom] = useState(1);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [showOptimizedRoutes, setShowOptimizedRoutes] = useState(true);

  useEffect(() => {
    if (starSystems.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // Create main group
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Calculate bounds for scaling
    const xExtent = d3.extent(starSystems, d => d.coordinates.x);
    const yExtent = d3.extent(starSystems, d => d.coordinates.y);
    
    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .range([0, width - margin.left - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .range([height - margin.top - margin.bottom, 0]);

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoom);

    // Draw all possible connections between stars (light gray)
    if (showRoutes) {
      const connectionGroup = g.append("g").attr("class", "connections");
      
      starSystems.forEach((source, i) => {
        starSystems.forEach((destination, j) => {
          if (i !== j) {
            connectionGroup.append("line")
              .attr("x1", xScale(source.coordinates.x))
              .attr("y1", yScale(source.coordinates.y))
              .attr("x2", xScale(destination.coordinates.x))
              .attr("y2", yScale(destination.coordinates.y))
              .attr("stroke", "#374151")
              .attr("stroke-width", 0.5)
              .attr("stroke-opacity", 0.2)
              .attr("class", "connection-line");
          }
        });
      });
    }

    // Draw optimized routes (highlighted)
    if (showOptimizedRoutes && optimizedRoutes.length > 0) {
      const routeGroup = g.append("g").attr("class", "optimized-routes");

      optimizedRoutes.forEach((route, index) => {
        // Get all systems in the route
        const routeSystems = [];
        
        // Add source system
        const source = starSystems.find(s => s._id === route.sourceSystem);
        if (source) routeSystems.push(source);
        
        // Add waypoints
        if (route.waypoints && route.waypoints.length > 0) {
          route.waypoints.forEach(waypointId => {
            const waypoint = starSystems.find(s => s._id === waypointId);
            if (waypoint) routeSystems.push(waypoint);
          });
        }
        
        // Add destination system
        const destination = starSystems.find(s => s._id === route.destinationSystem);
        if (destination) routeSystems.push(destination);

        if (routeSystems.length >= 2) {
          // Create path data
          const pathData = routeSystems.map(system => ({
            x: system.coordinates.x,
            y: system.coordinates.y,
            name: system.name
          }));

          // Draw the route path
          const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .curve(d3.curveCardinal);

          const routePath = routeGroup.append("path")
            .datum(pathData)
            .attr("d", line)
            .attr("stroke", route.isOptimal ? "#F59E0B" : "#6B46C1")
            .attr("stroke-width", route.isOptimal ? 5 : 3)
            .attr("stroke-opacity", route.isOptimal ? 1 : 0.8)
            .attr("fill", "none")
            .attr("class", "route-path")
            .style("stroke-dasharray", route.isOptimal ? "none" : "8,4")
            .style("filter", route.isOptimal ? "drop-shadow(0 0 8px #F59E0B)" : "drop-shadow(0 0 4px #6B46C1)");

          // Add animated dots along the route
          if (route.isOptimal) {
            const pathLength = routePath.node().getTotalLength();
            const numDots = Math.floor(pathLength / 50);
            
            for (let i = 0; i < numDots; i++) {
              const point = routePath.node().getPointAtLength((pathLength / numDots) * i);
              routeGroup.append("circle")
                .attr("cx", point.x)
                .attr("cy", point.y)
                .attr("r", 2)
                .attr("fill", "#F59E0B")
                .attr("opacity", 0.8)
                .style("animation", `pulse 2s ease-in-out infinite ${i * 0.2}s`);
            }
          }

          // Add route labels
          pathData.forEach((point, pointIndex) => {
            if (pointIndex === 0 || pointIndex === pathData.length - 1) {
              // Source and destination labels
              routeGroup.append("text")
                .attr("x", xScale(point.x))
                .attr("y", yScale(point.y) - 20)
                .attr("text-anchor", "middle")
                .attr("class", "route-label")
                .style("font-size", "10px")
                .style("fill", route.isOptimal ? "#F59E0B" : "#6B46C1")
                .style("font-weight", "bold")
                .style("text-shadow", "0 0 4px rgba(0,0,0,0.8)")
                .text(point.name);
            } else {
              // Waypoint labels
              routeGroup.append("text")
                .attr("x", xScale(point.x))
                .attr("y", yScale(point.y) - 15)
                .attr("text-anchor", "middle")
                .attr("class", "waypoint-label")
                .style("font-size", "8px")
                .style("fill", "#10B981")
                .style("font-weight", "bold")
                .style("text-shadow", "0 0 4px rgba(0,0,0,0.8)")
                .text(`WP: ${point.name}`);
            }
          });

          // Add profit and fuel information
          const midPoint = pathData[Math.floor(pathData.length / 2)];
          routeGroup.append("text")
            .attr("x", xScale(midPoint.x))
            .attr("y", yScale(midPoint.y) + 20)
            .attr("text-anchor", "middle")
            .attr("class", "profit-label")
            .style("font-size", route.isOptimal ? "12px" : "10px")
            .style("fill", route.isOptimal ? "#F59E0B" : "#6B46C1")
            .style("font-weight", "bold")
            .style("text-shadow", "0 0 4px rgba(0,0,0,0.8)")
            .text(`$${Math.round(route.profit || 0).toLocaleString()}`);

          if (route.fuelType) {
            routeGroup.append("text")
              .attr("x", xScale(midPoint.x))
              .attr("y", yScale(midPoint.y) + 35)
              .attr("text-anchor", "middle")
              .attr("class", "fuel-label")
              .style("font-size", "9px")
              .style("fill", "#EF4444")
              .style("font-weight", "bold")
              .style("text-shadow", "0 0 4px rgba(0,0,0,0.8)")
              .text(`${route.fuelType} (${route.fuelEfficiency}%)`);
          }
        }
      });
    }

    // Draw existing trade routes (if any)
    if (showRoutes && tradeRoutes.length > 0) {
      const existingRouteGroup = g.append("g").attr("class", "existing-routes");

      tradeRoutes.forEach(route => {
        const source = starSystems.find(s => s._id === route.sourceSystem);
        const destination = starSystems.find(s => s._id === route.destinationSystem);
        
        if (source && destination) {
          existingRouteGroup.append("line")
            .attr("x1", xScale(source.coordinates.x))
            .attr("y1", yScale(source.coordinates.y))
            .attr("x2", xScale(destination.coordinates.x))
            .attr("y2", yScale(destination.coordinates.y))
            .attr("stroke", "#8B5CF6")
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0.6)
            .attr("class", "existing-route")
            .style("stroke-dasharray", "3,3");
        }
      });
    }

    // Draw star systems
    const systemGroup = g.append("g").attr("class", "systems");

    const systems = systemGroup.selectAll(".system")
      .data(starSystems)
      .enter()
      .append("g")
      .attr("class", "system")
      .attr("transform", d => `translate(${xScale(d.coordinates.x)},${yScale(d.coordinates.y)})`)
      .style("cursor", "pointer");

    // Add circles for systems
    systems.append("circle")
      .attr("r", d => Math.max(3, Math.min(12, Math.log(d.population || 1) * 2)))
      .attr("fill", d => {
        if (d.isTradeHub) return "#F59E0B";
        if (d.economicGrowth > 0) return "#10B981";
        if (d.economicGrowth < 0) return "#EF4444";
        return "#6B46C1";
      })
      .attr("stroke", "#FFFFFF")
      .attr("stroke-width", 1)
      .attr("opacity", 0.8)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", Math.max(5, Math.min(15, Math.log(d.population || 1) * 2.5)))
          .attr("opacity", 1);
        
        setSelectedSystem(d);
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", Math.max(3, Math.min(12, Math.log(d.population || 1) * 2)))
          .attr("opacity", 0.8);
      })
      .on("click", function(event, d) {
        setSelectedSystem(d);
      });

    // Add labels
    if (showLabels) {
      systems.append("text")
        .attr("y", d => Math.max(15, Math.min(18, Math.log(d.population || 1) * 2.5)) + 5)
        .attr("text-anchor", "middle")
        .attr("class", "system-label")
        .style("font-size", "10px")
        .style("fill", "#E2E8F0")
        .style("font-weight", "500")
        .text(d => d.name);
    }

    // Add glow effect for selected system
    if (selectedSystem) {
      const selected = systems.filter(d => d._id === selectedSystem._id);
      selected.append("circle")
        .attr("r", Math.max(8, Math.min(20, Math.log(selectedSystem.population || 1) * 3)))
        .attr("fill", "none")
        .attr("stroke", "#F59E0B")
        .attr("stroke-width", 2)
        .attr("opacity", 0.6)
        .style("animation", "pulse 2s infinite");
    }

  }, [starSystems, tradeRoutes, showRoutes, showLabels, selectedSystem]);

  const resetZoom = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().duration(750).call(
      d3.zoom().transform,
      d3.zoomIdentity
    );
  };

  const zoomIn = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(
      d3.zoom().scaleBy,
      2
    );
  };

  const zoomOut = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(
      d3.zoom().scaleBy,
      0.5
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-space font-bold text-white">2D Galaxy Map</h1>
        <p className="text-asteroid-gray">Interactive visualization of star systems and trade routes</p>
      </div>

      {/* Controls */}
      <div className="glass-effect rounded-xl p-4 border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={zoomIn}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={zoomOut}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={resetZoom}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4 text-white" />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRoutes}
                  onChange={(e) => setShowRoutes(e.target.checked)}
                  className="w-4 h-4 text-nebula-purple bg-white/5 border-white/10 rounded focus:ring-nebula-purple"
                />
                <span className="text-white text-sm">Show All Connections</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOptimizedRoutes}
                  onChange={(e) => setShowOptimizedRoutes(e.target.checked)}
                  className="w-4 h-4 text-star-gold bg-white/5 border-white/10 rounded focus:ring-star-gold"
                />
                <span className="text-white text-sm">Show Optimized Routes</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="w-4 h-4 text-nebula-purple bg-white/5 border-white/10 rounded focus:ring-nebula-purple"
                />
                <span className="text-white text-sm">Show Labels</span>
              </label>
            </div>
          </div>

          <div className="text-sm text-asteroid-gray">
            Zoom: {zoom.toFixed(2)}x
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="glass-effect rounded-xl p-6 border border-white/10">
        <div className="relative">
          <svg
            ref={svgRef}
            className="w-full h-[600px] border border-white/10 rounded-lg"
            style={{ background: 'radial-gradient(circle at center, rgba(107, 70, 193, 0.1) 0%, transparent 70%)' }}
          />
          
          {/* Legend */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-sm">
            <h4 className="text-white font-semibold mb-2">Legend</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-star-gold"></div>
                <span className="text-white">Trade Hub</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-planet-green"></div>
                <span className="text-white">Growing Economy</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-white">Declining Economy</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-nebula-purple"></div>
                <span className="text-white">Standard System</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected System Info */}
      {selectedSystem && (
        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-asteroid-gray text-sm">Name</p>
              <p className="text-white font-medium">{selectedSystem.name}</p>
            </div>
            <div>
              <p className="text-asteroid-gray text-sm">Population</p>
              <p className="text-white font-medium">{selectedSystem.population?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-asteroid-gray text-sm">Coordinates</p>
              <p className="text-white font-medium">
                ({selectedSystem.coordinates?.x?.toFixed(1)}, {selectedSystem.coordinates?.y?.toFixed(1)}, {selectedSystem.coordinates?.z?.toFixed(1)})
              </p>
            </div>
            <div>
              <p className="text-asteroid-gray text-sm">Economic Growth</p>
              <p className={`font-medium ${selectedSystem.economicGrowth >= 0 ? 'text-planet-green' : 'text-red-400'}`}>
                {selectedSystem.economicGrowth > 0 ? '+' : ''}{selectedSystem.economicGrowth}%
              </p>
            </div>
            <div>
              <p className="text-asteroid-gray text-sm">Resources</p>
              <p className="text-white font-medium">{selectedSystem.resources?.length || 0}</p>
            </div>
            <div>
              <p className="text-asteroid-gray text-sm">Trade Hub</p>
              <p className="text-white font-medium">{selectedSystem.isTradeHub ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {starSystems.length === 0 && (
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-asteroid-gray mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Star Systems</h3>
          <p className="text-asteroid-gray">Add some star systems to see them on the map</p>
        </div>
      )}
    </div>
  );
};

export default GalaxyMap2D;
