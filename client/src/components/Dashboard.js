import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Route, 
  TrendingUp, 
  Fuel, 
  DollarSign,
  Activity,
  Zap,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = ({ starSystems, tradeRoutes, onDataUpdate }) => {
  const [stats, setStats] = useState({
    totalSystems: 0,
    totalRoutes: 0,
    totalTradeValue: 0,
    totalFuelCost: 0,
    averageProfit: 0,
    activeRoutes: 0
  });

  const [economicData, setEconomicData] = useState([]);
  const [resourceData, setResourceData] = useState([]);

  useEffect(() => {
    calculateStats();
    generateEconomicData();
    generateResourceData();
  }, [starSystems, tradeRoutes]);

  const calculateStats = () => {
    const totalSystems = starSystems.length;
    const totalRoutes = tradeRoutes.length;
    const totalTradeValue = tradeRoutes.reduce((sum, route) => sum + (route.tradeValue || 0), 0);
    const totalFuelCost = tradeRoutes.reduce((sum, route) => sum + (route.fuelCost || 0), 0);
    const averageProfit = totalRoutes > 0 ? (totalTradeValue - totalFuelCost) / totalRoutes : 0;
    const activeRoutes = tradeRoutes.filter(route => route.status === 'active').length;

    setStats({
      totalSystems,
      totalRoutes,
      totalTradeValue,
      totalFuelCost,
      averageProfit,
      activeRoutes
    });
  };

  const generateEconomicData = () => {
    // Generate economic growth data based on actual star systems
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = months.map((month, index) => {
      const baseValue = starSystems.reduce((sum, system) => sum + (system.population || 0), 0) / 1000;
      const growthFactor = 1 + (index * 0.1);
      
      return {
        month,
        tradeValue: Math.floor(baseValue * growthFactor * 1000),
        fuelCost: Math.floor(baseValue * growthFactor * 200),
        profit: Math.floor(baseValue * growthFactor * 800),
        economicGrowth: starSystems.reduce((sum, system) => sum + (system.economicGrowth || 0), 0) / starSystems.length
      };
    });
    setEconomicData(data);
  };

  const generateResourceData = () => {
    // Generate resource distribution data based on actual star systems
    const resourceMap = {};
    
    starSystems.forEach(system => {
      if (system.resources) {
        system.resources.forEach(resource => {
          if (resourceMap[resource.name]) {
            resourceMap[resource.name] += resource.availability;
          } else {
            resourceMap[resource.name] = resource.availability;
          }
        });
      }
    });

    const colors = ['#F59E0B', '#10B981', '#6B46C1', '#EF4444', '#3B82F6', '#8B5CF6', '#F97316'];
    const data = Object.entries(resourceMap).map(([name, value], index) => ({
      name,
      value: Math.round(value / starSystems.length), // Average availability
      color: colors[index % colors.length]
    }));
    
    setResourceData(data);
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="glass-effect rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-asteroid-gray text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend > 0 ? 'text-planet-green' : 'text-red-400'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-space font-bold text-white mb-4">
          Interstellar Trade Route Simulator
        </h1>
        <p className="text-asteroid-gray text-lg">
          Monitor and optimize trade routes across the galaxy
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title="Star Systems"
          value={stats.totalSystems}
          icon={Star}
          color="bg-nebula-purple/20"
          trend={5.2}
        />
        <StatCard
          title="Trade Routes"
          value={stats.totalRoutes}
          icon={Route}
          color="bg-cosmic-indigo/20"
          trend={12.8}
        />
        <StatCard
          title="Trade Value"
          value={`$${formatNumber(stats.totalTradeValue)}`}
          icon={DollarSign}
          color="bg-star-gold/20"
          trend={8.4}
        />
        <StatCard
          title="Fuel Cost"
          value={`$${formatNumber(stats.totalFuelCost)}`}
          icon={Fuel}
          color="bg-red-500/20"
          trend={-2.1}
        />
        <StatCard
          title="Avg Profit"
          value={`$${formatNumber(stats.averageProfit)}`}
          icon={TrendingUp}
          color="bg-planet-green/20"
          trend={15.3}
        />
        <StatCard
          title="Active Routes"
          value={stats.activeRoutes}
          icon={Activity}
          color="bg-blue-500/20"
          trend={3.7}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Economic Growth Chart */}
        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-star-gold" />
            Economic Growth Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={economicData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(11, 20, 38, 0.9)', 
                  border: '1px solid rgba(107, 70, 193, 0.3)',
                  borderRadius: '8px',
                  color: '#E2E8F0'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="tradeValue" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Trade Value"
              />
              <Line 
                type="monotone" 
                dataKey="fuelCost" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Fuel Cost"
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Profit"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Resource Distribution Chart */}
        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-planet-green" />
            Resource Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={resourceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {resourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(11, 20, 38, 0.9)', 
                  border: '1px solid rgba(107, 70, 193, 0.3)',
                  borderRadius: '8px',
                  color: '#E2E8F0'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Star System Resources */}
      {starSystems.length > 0 && (
        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-planet-green" />
            Resource Distribution by Star System
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {starSystems.map((system) => (
              <div key={system._id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white font-medium mb-3">{system.name}</h4>
                <div className="space-y-2">
                  {system.resources && system.resources.length > 0 ? (
                    system.resources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-asteroid-gray">{resource.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-nebula-purple h-2 rounded-full transition-all duration-300"
                              style={{ width: `${resource.availability}%` }}
                            ></div>
                          </div>
                          <span className="text-white text-xs">{resource.availability}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-asteroid-gray text-sm">No resources available</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="glass-effect rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-cosmic-indigo" />
          Recent Trade Activity
        </h3>
        <div className="space-y-4">
          {tradeRoutes.slice(0, 5).map((route, index) => (
            <div key={route._id || index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-star-gold rounded-full animate-pulse"></div>
                <div>
                  <p className="text-white font-medium">{route.name}</p>
                  <p className="text-asteroid-gray text-sm">
                    {route.routeType} • Distance: {route.distance?.toFixed(2)} LY
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-star-gold font-semibold">${formatNumber(route.tradeValue || 0)}</p>
                <p className="text-asteroid-gray text-sm">Profit: ${formatNumber(route.profit || 0)}</p>
              </div>
            </div>
          ))}
          {tradeRoutes.length === 0 && (
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-asteroid-gray mx-auto mb-4" />
              <p className="text-asteroid-gray">No trade routes found. Create some to see activity here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
