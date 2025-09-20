import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Rocket, 
  Zap, 
  Globe, 
  BarChart3, 
  MapPin, 
  Route,
  ArrowRight,
  Play,
  Star,
  Users,
  TrendingUp,
  Shield,
  CheckCircle
} from 'lucide-react';

const LandingPage = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Star System Management",
      description: "Create and manage star systems with detailed coordinates, population, and resource data."
    },
    {
      icon: <Route className="w-8 h-8" />,
      title: "Route Optimization",
      description: "Advanced algorithms to find the most profitable trade routes across the galaxy."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Economic Analytics",
      description: "Comprehensive dashboards showing trade values, fuel costs, and economic growth."
    }
  ];

  const stats = [
    { number: "1000+", label: "Star Systems" },
    { number: "5000+", label: "Trade Routes" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  const testimonials = [
    {
      name: "Captain Sarah Chen",
      role: "Fleet Commander",
      content: "This simulator revolutionized our trade operations. We've increased profits by 300%!",
      rating: 5
    },
    {
      name: "Dr. Marcus Webb",
      role: "Economic Analyst",
      content: "The analytics are incredibly detailed. Perfect for strategic planning.",
      rating: 5
    },
    {
      name: "Commander Alex Rivera",
      role: "Trade Coordinator",
      content: "The 3D visualization helps us understand complex route networks instantly.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen space-bg">
      {/* Navigation */}
      <nav className="glass-effect border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-nebula-purple to-cosmic-indigo rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-space font-bold text-white">
                Interstellar Trade
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-asteroid-gray hover:text-white transition-colors">Features</a>
              <a href="#about" className="text-asteroid-gray hover:text-white transition-colors">About</a>
              <a href="#testimonials" className="text-asteroid-gray hover:text-white transition-colors">Testimonials</a>
              <Link 
                to="/dashboard" 
                className="px-4 py-2 bg-nebula-purple text-white rounded-lg hover:bg-nebula-purple/80 transition-colors"
              >
                Launch App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Spaceship */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            {/* Stars */}
            <div className="absolute inset-0">
              <div className="absolute top-20 left-10 w-2 h-2 bg-white rounded-full opacity-80 animate-pulse"></div>
              <div className="absolute top-40 right-20 w-1 h-1 bg-blue-300 rounded-full opacity-60"></div>
              <div className="absolute top-60 left-1/4 w-1.5 h-1.5 bg-purple-300 rounded-full opacity-70"></div>
              <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-cyan-300 rounded-full opacity-50"></div>
              <div className="absolute bottom-60 left-1/2 w-2 h-2 bg-yellow-300 rounded-full opacity-60"></div>
              <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-pink-300 rounded-full opacity-40"></div>
              <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-green-300 rounded-full opacity-50"></div>
            </div>
            
            {/* Nebula Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-radial from-blue-500/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-pink-500/15 to-transparent rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Spaceship SVG */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="relative">
            {/* Spaceship Body */}
            <div className="relative spaceship-float">
              {/* Main Hull */}
              <div className="w-32 h-16 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg transform rotate-12 shadow-2xl">
                {/* Cockpit */}
                <div className="absolute top-1 left-2 w-8 h-6 bg-gradient-to-r from-amber-400/30 to-orange-400/30 rounded-md border border-amber-300/50"></div>
                {/* Side Panels */}
                <div className="absolute top-2 right-4 w-6 h-4 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded border border-blue-300/30"></div>
                <div className="absolute bottom-2 right-4 w-6 h-4 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded border border-blue-300/30"></div>
                {/* Wings */}
                <div className="absolute -top-2 -right-2 w-8 h-4 bg-gradient-to-r from-slate-600 to-slate-500 rounded transform rotate-45"></div>
                <div className="absolute -bottom-2 -right-2 w-8 h-4 bg-gradient-to-r from-slate-600 to-slate-500 rounded transform -rotate-45"></div>
              </div>
              
              {/* Thruster Beams */}
              <div className="absolute -left-20 top-1/2 transform -translate-y-1/2">
                <div className="w-24 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-sm opacity-80 thruster-glow"></div>
                <div className="w-32 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-sm opacity-60 mt-1 thruster-glow"></div>
                <div className="w-40 h-0.5 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full blur-sm opacity-40 mt-1 thruster-glow"></div>
              </div>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg blur-xl"></div>
            </div>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-20 text-center px-4">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl md:text-7xl font-space font-bold text-white mb-6">
              Interstellar Trade
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-star-gold to-nebula-purple">
                Route Simulator
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-asteroid-gray mb-12 max-w-3xl mx-auto">
              Optimize trade routes across the galaxy with advanced algorithms, 
              real-time analytics, and immersive 3D visualizations.
            </p>
            
            {/* Central Create Project Button */}
            <div className="mb-8">
              <Link 
                to="/dashboard"
                className="group relative inline-flex items-center justify-center px-12 py-6 text-2xl font-bold text-white bg-gradient-to-r from-nebula-purple via-cosmic-indigo to-star-gold rounded-2xl hover:from-nebula-purple/90 hover:via-cosmic-indigo/90 hover:to-star-gold/90 transition-all duration-500 transform hover:scale-105 shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-nebula-purple via-cosmic-indigo to-star-gold rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                <div className="relative flex items-center space-x-3">
                  <Rocket className="w-8 h-8" />
                  <span>Create New Project</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </Link>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group px-8 py-4 glass-effect text-white rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span className="font-semibold">Watch Demo</span>
              </button>
              <button className="group px-8 py-4 glass-effect text-white rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span className="font-semibold">View Analytics</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center space-y-2 text-asteroid-gray">
            <span className="text-sm">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-asteroid-gray rounded-full flex justify-center">
              <div className="w-1 h-3 bg-asteroid-gray rounded-full mt-2 animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-asteroid-gray">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-space font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-asteroid-gray max-w-2xl mx-auto">
              Everything you need to optimize your interstellar trade operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`glass-effect rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 ${
                  currentFeature === index ? 'border-nebula-purple/50 bg-nebula-purple/5' : ''
                }`}
              >
                <div className="text-nebula-purple mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-asteroid-gray">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-space font-bold text-white mb-6">
                Advanced Trade Simulation
              </h2>
              <p className="text-lg text-asteroid-gray mb-6">
                Our platform combines cutting-edge algorithms with intuitive visualizations 
                to help you discover the most profitable trade routes across the galaxy.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-planet-green" />
                  <span className="text-white">Real-time route optimization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-planet-green" />
                  <span className="text-white">3D galaxy visualization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-planet-green" />
                  <span className="text-white">Economic analytics dashboard</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-planet-green" />
                  <span className="text-white">CSV import/export support</span>
                </div>
              </div>
            </div>
            <div className="glass-effect rounded-xl p-8 border border-white/10">
              <div className="aspect-video bg-gradient-to-br from-nebula-purple/20 to-cosmic-indigo/20 rounded-lg flex items-center justify-center">
                <Globe className="w-16 h-16 text-nebula-purple" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-space font-bold text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-asteroid-gray">
              Join thousands of satisfied traders across the galaxy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glass-effect rounded-xl p-6 border border-white/10">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-star-gold fill-current" />
                  ))}
                </div>
                <p className="text-asteroid-gray mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="text-white font-semibold">{testimonial.name}</div>
                  <div className="text-asteroid-gray text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="glass-effect rounded-2xl p-12 border border-white/10 max-w-4xl mx-auto">
            <h2 className="text-4xl font-space font-bold text-white mb-6">
              Ready to Optimize Your Trade Routes?
            </h2>
            <p className="text-xl text-asteroid-gray mb-8">
              Join the most advanced trade simulation platform in the galaxy
            </p>
            <Link 
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-star-gold to-nebula-purple text-white rounded-xl hover:from-star-gold/80 hover:to-nebula-purple/80 transition-all duration-300 font-semibold"
            >
              <Rocket className="w-5 h-5" />
              <span>Launch Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-nebula-purple to-cosmic-indigo rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-space font-bold text-white">
              Interstellar Trade
            </span>
          </div>
          <p className="text-asteroid-gray">
            © 2024 Interstellar Trade Route Simulator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
