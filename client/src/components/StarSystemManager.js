import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  MapPin, 
  Users, 
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

const StarSystemManager = ({ starSystems, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    coordinates: { x: 0, y: 0, z: 0 },
    population: 0,
    resources: [],
    consumption: [],
    isTradeHub: false,
    economicGrowth: 0,
    fuelStation: { available: true, price: 1.0 }
  });

  const [newResource, setNewResource] = useState({ name: '', availability: 0, price: 0 });
  const [newConsumption, setNewConsumption] = useState({ resourceName: '', amount: 0 });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSystem) {
        await apiService.updateStarSystem(editingSystem._id, formData);
        toast.success('Star system updated successfully!');
      } else {
        await apiService.createStarSystem(formData);
        toast.success('Star system created successfully!');
      }
      
      const updatedSystems = await apiService.getStarSystems();
      onUpdate(updatedSystems);
      resetForm();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (system) => {
    setEditingSystem(system);
    setFormData({
      name: system.name,
      coordinates: system.coordinates,
      population: system.population,
      resources: system.resources || [],
      consumption: system.consumption || [],
      isTradeHub: system.isTradeHub || false,
      economicGrowth: system.economicGrowth || 0,
      fuelStation: system.fuelStation || { available: true, price: 1.0 }
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this star system?')) {
      try {
        await apiService.deleteStarSystem(id);
        toast.success('Star system deleted successfully!');
        const updatedSystems = await apiService.getStarSystems();
        onUpdate(updatedSystems);
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      coordinates: { x: 0, y: 0, z: 0 },
      population: 0,
      resources: [],
      consumption: [],
      isTradeHub: false,
      economicGrowth: 0,
      fuelStation: { available: true, price: 1.0 }
    });
    setEditingSystem(null);
    setIsModalOpen(false);
  };

  const addResource = () => {
    if (newResource.name && newResource.availability >= 0 && newResource.price >= 0) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, { ...newResource }]
      }));
      setNewResource({ name: '', availability: 0, price: 0 });
    }
  };

  const removeResource = (index) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  const addConsumption = () => {
    if (newConsumption.resourceName && newConsumption.amount >= 0) {
      setFormData(prev => ({
        ...prev,
        consumption: [...prev.consumption, { ...newConsumption }]
      }));
      setNewConsumption({ resourceName: '', amount: 0 });
    }
  };

  const removeConsumption = (index) => {
    setFormData(prev => ({
      ...prev,
      consumption: prev.consumption.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const systems = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const system = {};
        headers.forEach((header, index) => {
          if (header === 'coordinates') {
            system.coordinates = {
              x: parseFloat(values[index]) || 0,
              y: parseFloat(values[index + 1]) || 0,
              z: parseFloat(values[index + 2]) || 0
            };
          } else {
            system[header] = isNaN(values[index]) ? values[index] : parseFloat(values[index]);
          }
        });
        return system;
      }).filter(system => system.name);

      await apiService.createBulkStarSystems(systems);
      toast.success(`Successfully imported ${systems.length} star systems!`);
      const updatedSystems = await apiService.getStarSystems();
      onUpdate(updatedSystems);
    } catch (error) {
      toast.error('Failed to import file: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const exportSystems = () => {
    const csvContent = [
      'name,coordinates.x,coordinates.y,coordinates.z,population,isTradeHub,economicGrowth',
      ...starSystems.map(system => 
        `${system.name},${system.coordinates.x},${system.coordinates.y},${system.coordinates.z},${system.population},${system.isTradeHub},${system.economicGrowth}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'star_systems.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-space font-bold text-white">Star Systems</h1>
          <p className="text-asteroid-gray">Manage star systems and their resources</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportSystems}
            className="flex items-center space-x-2 px-4 py-2 bg-cosmic-indigo/20 text-cosmic-indigo border border-cosmic-indigo/30 rounded-lg hover:bg-cosmic-indigo/30 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <label className="flex items-center space-x-2 px-4 py-2 bg-nebula-purple/20 text-nebula-purple border border-nebula-purple/30 rounded-lg hover:bg-nebula-purple/30 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Uploading...' : 'Import'}</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-star-gold/20 text-star-gold border border-star-gold/30 rounded-lg hover:bg-star-gold/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add System</span>
          </button>
        </div>
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {starSystems.map((system) => (
          <div key={system._id} className="glass-effect rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-nebula-purple" />
                <h3 className="text-lg font-semibold text-white">{system.name}</h3>
                {system.isTradeHub && (
                  <div className="px-2 py-1 bg-star-gold/20 text-star-gold text-xs rounded-full">
                    Hub
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(system)}
                  className="p-1 text-asteroid-gray hover:text-white transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(system._id)}
                  className="p-1 text-asteroid-gray hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Users className="w-4 h-4 text-asteroid-gray" />
                <span className="text-asteroid-gray">Population:</span>
                <span className="text-white">{system.population?.toLocaleString()}</span>
              </div>
              
              <div className="text-sm">
                <span className="text-asteroid-gray">Coordinates: </span>
                <span className="text-white">
                  ({system.coordinates?.x?.toFixed(1)}, {system.coordinates?.y?.toFixed(1)}, {system.coordinates?.z?.toFixed(1)})
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <Zap className="w-4 h-4 text-asteroid-gray" />
                <span className="text-asteroid-gray">Resources:</span>
                <span className="text-white">{system.resources?.length || 0}</span>
              </div>

              {system.economicGrowth !== undefined && (
                <div className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${system.economicGrowth >= 0 ? 'bg-planet-green' : 'bg-red-400'}`}></div>
                  <span className="text-asteroid-gray">Growth:</span>
                  <span className={`${system.economicGrowth >= 0 ? 'text-planet-green' : 'text-red-400'}`}>
                    {system.economicGrowth > 0 ? '+' : ''}{system.economicGrowth}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {starSystems.length === 0 && (
          <div className="col-span-full text-center py-12">
            <MapPin className="w-16 h-16 text-asteroid-gray mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Star Systems</h3>
            <p className="text-asteroid-gray mb-6">Create your first star system to get started</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-star-gold/20 text-star-gold border border-star-gold/30 rounded-lg hover:bg-star-gold/30 transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add First System</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-effect rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-white mb-6">
              {editingSystem ? 'Edit Star System' : 'Add New Star System'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-nebula-purple focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Population</label>
                  <input
                    type="number"
                    name="population"
                    value={formData.population}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-nebula-purple focus:outline-none"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Coordinates</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-asteroid-gray mb-1">X</label>
                    <input
                      type="number"
                      name="coordinates.x"
                      value={formData.coordinates.x}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-nebula-purple focus:outline-none"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-asteroid-gray mb-1">Y</label>
                    <input
                      type="number"
                      name="coordinates.y"
                      value={formData.coordinates.y}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-nebula-purple focus:outline-none"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-asteroid-gray mb-1">Z</label>
                    <input
                      type="number"
                      name="coordinates.z"
                      value={formData.coordinates.z}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-nebula-purple focus:outline-none"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Economic Growth (%)</label>
                  <input
                    type="number"
                    name="economicGrowth"
                    value={formData.economicGrowth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-nebula-purple focus:outline-none"
                    min="-100"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isTradeHub"
                      checked={formData.isTradeHub}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-nebula-purple bg-white/5 border-white/10 rounded focus:ring-nebula-purple"
                    />
                    <span className="text-white">Trade Hub</span>
                  </label>
                </div>
              </div>

              {/* Resources */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Resources</label>
                <div className="space-y-2">
                  {formData.resources.map((resource, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-white text-sm w-20">{resource.name}</span>
                      <span className="text-asteroid-gray text-sm w-16">Avail: {resource.availability}%</span>
                      <span className="text-asteroid-gray text-sm w-16">Price: ${resource.price}</span>
                      <button
                        type="button"
                        onClick={() => removeResource(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Resource name"
                      value={newResource.name}
                      onChange={(e) => setNewResource({...newResource, name: e.target.value})}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-nebula-purple focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Availability %"
                      value={newResource.availability}
                      onChange={(e) => setNewResource({...newResource, availability: parseFloat(e.target.value) || 0})}
                      className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-nebula-purple focus:outline-none"
                      min="0"
                      max="100"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={newResource.price}
                      onChange={(e) => setNewResource({...newResource, price: parseFloat(e.target.value) || 0})}
                      className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-nebula-purple focus:outline-none"
                      min="0"
                    />
                    <button
                      type="button"
                      onClick={addResource}
                      className="px-3 py-2 bg-planet-green/20 text-planet-green border border-planet-green/30 rounded-lg hover:bg-planet-green/30 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-asteroid-gray hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-nebula-purple text-white rounded-lg hover:bg-nebula-purple/80 transition-colors"
                >
                  {editingSystem ? 'Update' : 'Create'} System
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StarSystemManager;
