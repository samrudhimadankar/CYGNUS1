import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import StarSystemManager from './components/StarSystemManager';
import RouteOptimizer from './components/RouteOptimizer';
import GalaxyMap2D from './components/visualizations/GalaxyMap2D';
import GalaxyMap3D from './components/visualizations/GalaxyMap3D';

// Services
import { apiService } from './services/apiService';

// Inner App Component that uses useLocation
function AppContent() {
  const location = useLocation();
  const [starSystems, setStarSystems] = useState([]);
  const [tradeRoutes, setTradeRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFuel, setSelectedFuel] = useState({ name: 'Fuel A', cost: 120, efficiency: 70 });
  const [fuelTypes, setFuelTypes] = useState([]);
  const [optimizedRoutes, setOptimizedRoutes] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [systemsData, routesData] = await Promise.all([
        apiService.getStarSystems(),
        apiService.getTradeRoutes()
      ]);
      
      setStarSystems(systemsData);
      setTradeRoutes(routesData);
      setError(null);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleStarSystemUpdate = (updatedSystems) => {
    setStarSystems(updatedSystems);
  };

  const handleTradeRouteUpdate = (updatedRoutes) => {
    setTradeRoutes(updatedRoutes);
  };

  const handleOptimizedRoutesUpdate = (routes) => {
    setOptimizedRoutes(routes);
  };

  if (loading) {
    return (
      <div className="min-h-screen space-bg star-field flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-nebula-purple mx-auto mb-4"></div>
          <h2 className="text-2xl font-space text-white mb-2">Initializing Trade Routes</h2>
          <p className="text-asteroid-gray loading-dots">Loading star systems</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-bg star-field">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(11, 20, 38, 0.9)',
            color: '#E2E8F0',
            border: '1px solid rgba(107, 70, 193, 0.3)',
          },
        }}
      />
      
      {location.pathname !== '/' && (
        <Navbar 
          selectedFuel={selectedFuel}
          onFuelChange={setSelectedFuel}
          onFuelTypesChange={setFuelTypes}
        />
      )}
      
      <main>
        <Routes>
          <Route 
            path="/" 
            element={<LandingPage />} 
          />
          <Route 
            path="/dashboard" 
            element={
              <div className="container mx-auto px-4 py-8">
                <Dashboard 
                  starSystems={starSystems}
                  tradeRoutes={tradeRoutes}
                  onDataUpdate={loadInitialData}
                />
              </div>
            } 
          />
          <Route 
            path="/systems" 
            element={
              <div className="container mx-auto px-4 py-8">
                <StarSystemManager 
                  starSystems={starSystems}
                  onUpdate={handleStarSystemUpdate}
                />
              </div>
            } 
          />
            <Route 
              path="/routes" 
              element={
                <div className="container mx-auto px-4 py-8">
                  <RouteOptimizer 
                    starSystems={starSystems}
                    tradeRoutes={tradeRoutes}
                    onUpdate={handleTradeRouteUpdate}
                    onOptimizedRoutesUpdate={handleOptimizedRoutesUpdate}
                    selectedFuel={selectedFuel}
                    fuelTypes={fuelTypes}
                  />
                </div>
              } 
            />
          <Route 
            path="/map-2d" 
            element={
              <div className="container mx-auto px-4 py-8">
                <GalaxyMap2D 
                  starSystems={starSystems}
                  tradeRoutes={tradeRoutes}
                  optimizedRoutes={optimizedRoutes}
                />
              </div>
            } 
          />
          <Route 
            path="/map-3d" 
            element={
              <div className="container mx-auto px-4 py-8">
                <GalaxyMap3D 
                  starSystems={starSystems}
                  tradeRoutes={tradeRoutes}
                  optimizedRoutes={optimizedRoutes}
                />
              </div>
            } 
          />
        </Routes>
      </main>
      
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}

// Main App Component with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
