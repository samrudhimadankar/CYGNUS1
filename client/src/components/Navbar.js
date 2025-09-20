import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MapPin, 
  Route, 
  Map, 
  Box, 
  Menu, 
  X,
  Zap
} from 'lucide-react';
import FuelManager from './FuelManager';

const Navbar = ({ selectedFuel, onFuelChange, onFuelTypesChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Star Systems', href: '/systems', icon: MapPin },
    { name: 'Trade Routes', href: '/routes', icon: Route },
    { name: '2D Galaxy Map', href: '/map-2d', icon: Map },
    { name: '3D Space View', href: '/map-3d', icon: Box },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-effect border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-nebula-purple to-cosmic-indigo rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-space font-bold text-white">
              Interstellar Trade
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-nebula-purple/20 text-nebula-purple-300 border border-nebula-purple/30'
                      : 'text-asteroid-gray hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Fuel Manager */}
            <div className="ml-4 pl-4 border-l border-white/10">
              <FuelManager 
                selectedFuel={selectedFuel}
                onFuelChange={onFuelChange}
                onFuelTypesChange={onFuelTypesChange}
              />
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-asteroid-gray hover:text-white hover:bg-white/5 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-nebula-purple/20 text-nebula-purple-300 border border-nebula-purple/30'
                        : 'text-asteroid-gray hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
