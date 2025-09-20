import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { 
  RotateCcw, 
  Settings,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

// Simple Orbit Controls Implementation
const SimpleOrbitControls = ({ ref }) => {
  const { camera, gl } = useThree();
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    const controls = {
      target: new THREE.Vector3(0, 0, 0),
      enableRotate: true,
      enableZoom: true,
      enablePan: true,
      rotateSpeed: 1.0,
      zoomSpeed: 1.2,
      panSpeed: 0.8,
      minDistance: 5,
      maxDistance: 100,
      maxPolarAngle: Math.PI,
      minPolarAngle: 0,
      maxAzimuthAngle: Infinity,
      minAzimuthAngle: -Infinity,
      enableDamping: true,
      dampingFactor: 0.05,
      enableKeys: true,
      keyPanSpeed: 7.0,
      autoRotate: false,
      autoRotateSpeed: 2.0,
      enableDamping: true,
      dampingFactor: 0.05,
      screenSpacePanning: false,
      reset: () => {
        camera.position.set(20, 20, 20);
        camera.lookAt(0, 0, 0);
      }
    };

    let isMouseDown = false;
    let mouseX = 0, mouseY = 0;
    let spherical = new THREE.Spherical();
    let sphericalDelta = new THREE.Spherical();
    let scale = 1;
    let panOffset = new THREE.Vector3();
    let zoomChanged = false;

    const handleMouseDown = (event) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseMove = (event) => {
      if (!isMouseDown) return;

      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;

      if (event.buttons === 1) { // Left mouse button - rotate
        sphericalDelta.theta -= deltaX * 0.01;
        sphericalDelta.phi -= deltaY * 0.01;
      } else if (event.buttons === 2) { // Right mouse button - pan
        const panLeft = new THREE.Vector3();
        const panUp = new THREE.Vector3();
        const pan = new THREE.Vector3();
        
        panLeft.setFromMatrixColumn(camera.matrix, 0);
        panUp.setFromMatrixColumn(camera.matrix, 1);
        
        panLeft.multiplyScalar(-deltaX * 0.01);
        panUp.multiplyScalar(deltaY * 0.01);
        
        pan.addVectors(panLeft, panUp);
        panOffset.add(pan);
      }

      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleWheel = (event) => {
      if (event.deltaY < 0) {
        scale *= 1.1;
      } else {
        scale /= 1.1;
      }
      zoomChanged = true;
    };

    const update = () => {
      const position = camera.position;
      const offset = position.clone().sub(controls.target).add(panOffset);
      
      spherical.setFromVector3(offset);
      spherical.theta += sphericalDelta.theta;
      spherical.phi += sphericalDelta.phi;
      spherical.theta = Math.max(controls.minAzimuthAngle, Math.min(controls.maxAzimuthAngle, spherical.theta));
      spherical.phi = Math.max(controls.minPolarAngle, Math.min(controls.maxPolarAngle, spherical.phi));
      
      if (zoomChanged) {
        spherical.radius *= scale;
        spherical.radius = Math.max(controls.minDistance, Math.min(controls.maxDistance, spherical.radius));
        zoomChanged = false;
      }
      
      offset.setFromSpherical(spherical);
      position.copy(controls.target).add(offset);
      camera.lookAt(controls.target);
      
      sphericalDelta.set(0, 0, 0);
      panOffset.set(0, 0, 0);
    };

    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('mouseup', handleMouseUp);
    gl.domElement.addEventListener('wheel', handleWheel);

    const animate = () => {
      requestAnimationFrame(animate);
      update();
    };
    animate();

    // controlsRef.current = controls;

    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('mouseup', handleMouseUp);
      gl.domElement.removeEventListener('wheel', handleWheel);
    };
  }, [camera, gl, enabled]);

  return null;
};

// Star System Component
const StarSystem = ({ system, isSelected, onSelect, showLabels }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (hovered || isSelected) {
        meshRef.current.scale.setScalar(1.2);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  const getSystemColor = () => {
    if (system.isTradeHub) return '#F59E0B';
    if (system.economicGrowth > 0) return '#10B981';
    if (system.economicGrowth < 0) return '#EF4444';
    return '#6B46C1';
  };

  const getSystemSize = () => {
    return Math.max(0.5, Math.min(2, Math.log(system.population || 1) * 0.3));
  };

  return (
    <group
      position={[system.coordinates.x, system.coordinates.y, system.coordinates.z]}
    >
      <mesh
        ref={meshRef}
        onClick={() => onSelect(system)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[getSystemSize(), 16, 16]} />
        <meshStandardMaterial
          color={getSystemColor()}
          emissive={getSystemColor()}
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {isSelected && (
        <mesh>
          <sphereGeometry args={[getSystemSize() * 1.5, 16, 16]} />
          <meshBasicMaterial
            color="#F59E0B"
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      )}

      {/* Glow effect */}
      <mesh>
        <sphereGeometry args={[getSystemSize() * 2, 8, 8]} />
        <meshBasicMaterial
          color={getSystemColor()}
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
};

// Trade Route Component
const TradeRoute = ({ route, starSystems, isVisible, isOptimized = false }) => {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const source = starSystems.find(s => s._id === route.sourceSystem);
    const destination = starSystems.find(s => s._id === route.destinationSystem);
    
    if (source && destination) {
      const routePoints = [
        new THREE.Vector3(source.coordinates.x, source.coordinates.y, source.coordinates.z)
      ];
      
      // Add waypoints
      if (route.waypoints && route.waypoints.length > 0) {
        route.waypoints.forEach(waypointId => {
          const waypoint = starSystems.find(s => s._id === waypointId);
          if (waypoint) {
            routePoints.push(new THREE.Vector3(
              waypoint.coordinates.x, 
              waypoint.coordinates.y, 
              waypoint.coordinates.z
            ));
          }
        });
      }
      
      routePoints.push(new THREE.Vector3(
        destination.coordinates.x, 
        destination.coordinates.y, 
        destination.coordinates.z
      ));
      
      setPoints(routePoints);
    }
  }, [route, starSystems, isVisible]);

  if (!isVisible || points.length < 2) return null;

  return (
    <group>
      {/* Route line */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={route.isOptimal ? "#F59E0B" : "#6B46C1"}
          opacity={isOptimized ? 0.9 : 0.6}
          transparent
          linewidth={route.isOptimal ? 4 : 2}
        />
      </line>

      {/* Animated dots for optimal routes */}
      {route.isOptimal && isOptimized && points.map((point, index) => (
        <mesh key={index} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial
            color="#F59E0B"
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Route labels */}
      {isOptimized && points.map((point, index) => {
        const isSource = index === 0;
        const isDestination = index === points.length - 1;
        const isWaypoint = !isSource && !isDestination;
        
        return (
          <mesh key={`label-${index}`} position={[point.x, point.y + 1, point.z]}>
            <planeGeometry args={[2, 0.5]} />
            <meshBasicMaterial
              color={isSource ? "#F59E0B" : isDestination ? "#F59E0B" : "#10B981"}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// Camera Controller
const CameraController = ({ zoom }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);
  }, [camera, zoom]);

  return null;
};

// Main 3D Galaxy Map Component
const GalaxyMap3D = ({ starSystems, tradeRoutes, optimizedRoutes = [] }) => {
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showOptimizedRoutes, setShowOptimizedRoutes] = useState(true);
  const [zoom, setZoom] = useState(1);
  // const controlsRef = useRef();

  const resetCamera = () => {
    // This will be handled by the SimpleOrbitControls
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-space font-bold text-white">3D Space View</h1>
        <p className="text-asteroid-gray">Immersive 3D visualization of star systems and trade routes</p>
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
                onClick={resetCamera}
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
                <span className="text-white text-sm">Show Existing Routes</span>
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
            Systems: {starSystems.length} | Routes: {tradeRoutes.length}
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="glass-effect rounded-xl p-6 border border-white/10">
        <div className="relative h-[600px]">
          <Canvas
            camera={{ position: [20, 20, 20], fov: 60 }}
            style={{ background: 'radial-gradient(circle at center, rgba(107, 70, 193, 0.1) 0%, rgba(11, 20, 38, 0.8) 100%)' }}
          >
            <CameraController zoom={zoom} />
            <SimpleOrbitControls />
            
            {/* Lighting */}
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />
            <pointLight position={[-10, -10, -10]} intensity={0.3} color="#6B46C1" />
            
            {/* Star field background */}
            <mesh>
              <sphereGeometry args={[100, 32, 32]} />
              <meshBasicMaterial
                color="#0B1426"
                side={THREE.BackSide}
                transparent
                opacity={0.8}
              />
            </mesh>

            {/* Star systems */}
            {starSystems.map((system) => (
              <StarSystem
                key={system._id}
                system={system}
                isSelected={selectedSystem?._id === system._id}
                onSelect={setSelectedSystem}
                showLabels={showLabels}
              />
            ))}

            {/* Trade routes */}
            {/* Optimized Routes */}
            {showOptimizedRoutes && optimizedRoutes.map((route, index) => (
              <TradeRoute
                key={`optimized-${index}`}
                route={route}
                starSystems={starSystems}
                isVisible={true}
                isOptimized={true}
              />
            ))}

            {/* Existing Trade Routes */}
            {showRoutes && tradeRoutes.map((route, index) => (
              <TradeRoute
                key={`existing-${index}`}
                route={route}
                starSystems={starSystems}
                isVisible={showRoutes}
                isOptimized={false}
              />
            ))}
          </Canvas>
          
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

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-sm text-asteroid-gray">
            <p>🖱️ Left click + drag to rotate</p>
            <p>🖱️ Right click + drag to pan</p>
            <p>🖱️ Scroll to zoom</p>
            <p>🖱️ Click systems to select</p>
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
          <p className="text-asteroid-gray">Add some star systems to see them in 3D space</p>
        </div>
      )}
    </div>
  );
};

export default GalaxyMap3D;