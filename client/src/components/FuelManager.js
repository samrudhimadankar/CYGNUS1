import React, { useState, useEffect } from 'react';
import { Fuel, Settings, Plus, Trash2, Edit, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const FuelManager = ({ selectedFuel, onFuelChange, onFuelTypesChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fuelTypes, setFuelTypes] = useState([
    { name: 'Fuel A', cost: 120, efficiency: 70 },
    { name: 'Fuel B', cost: 150, efficiency: 85 },
    { name: 'Fuel C', cost: 200, efficiency: 95 },
    { name: 'Fuel D', cost: 80, efficiency: 50 },
    { name: 'Fuel E', cost: 300, efficiency: 98 }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFuel, setEditingFuel] = useState(null);
  const [newFuel, setNewFuel] = useState({ name: '', cost: 0, efficiency: 0 });

  useEffect(() => {
    if (onFuelTypesChange) {
      onFuelTypesChange(fuelTypes);
    }
  }, [fuelTypes, onFuelTypesChange]);

  const handleFuelSelect = (fuel) => {
    onFuelChange(fuel);
    setIsOpen(false);
    toast.success(`Selected ${fuel.name}`);
  };

  const handleAddFuel = () => {
    if (newFuel.name && newFuel.cost > 0 && newFuel.efficiency > 0 && newFuel.efficiency <= 100) {
      const fuel = { ...newFuel, id: Date.now() };
      setFuelTypes([...fuelTypes, fuel]);
      setNewFuel({ name: '', cost: 0, efficiency: 0 });
      toast.success('Fuel type added successfully!');
    } else {
      toast.error('Please fill all fields correctly (efficiency must be 0-100%)');
    }
  };

  const handleEditFuel = (fuel) => {
    setEditingFuel(fuel);
    setNewFuel({ name: fuel.name, cost: fuel.cost, efficiency: fuel.efficiency });
    setIsEditing(true);
  };

  const handleUpdateFuel = () => {
    if (newFuel.name && newFuel.cost > 0 && newFuel.efficiency > 0 && newFuel.efficiency <= 100) {
      setFuelTypes(fuelTypes.map(f => f.id === editingFuel.id ? { ...newFuel, id: editingFuel.id } : f));
      setNewFuel({ name: '', cost: 0, efficiency: 0 });
      setEditingFuel(null);
      setIsEditing(false);
      toast.success('Fuel type updated successfully!');
    } else {
      toast.error('Please fill all fields correctly (efficiency must be 0-100%)');
    }
  };

  const handleDeleteFuel = (fuelId) => {
    if (fuelTypes.length > 1) {
      setFuelTypes(fuelTypes.filter(f => f.id !== fuelId));
      if (selectedFuel && selectedFuel.id === fuelId) {
        onFuelChange(fuelTypes[0]);
      }
      toast.success('Fuel type deleted successfully!');
    } else {
      toast.error('Cannot delete the last fuel type');
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return 'text-green-400';
    if (efficiency >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getEfficiencyBg = (efficiency) => {
    if (efficiency >= 90) return 'bg-green-500/20 border-green-500/30';
    if (efficiency >= 70) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="relative">
      {/* Fuel Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
      >
        <Fuel className="w-4 h-4 text-nebula-purple" />
        <span className="text-white">
          {selectedFuel ? selectedFuel.name : 'Select Fuel'}
        </span>
        <span className="text-asteroid-gray">
          {selectedFuel ? `$${selectedFuel.cost} (${selectedFuel.efficiency}%)` : ''}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 glass-effect rounded-xl border border-white/10 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Fuel Types</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1 text-asteroid-gray hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Fuel List */}
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {fuelTypes.map((fuel) => (
                <div
                  key={fuel.id || fuel.name}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedFuel && selectedFuel.name === fuel.name
                      ? 'border-nebula-purple bg-nebula-purple/20'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => handleFuelSelect(fuel)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{fuel.name}</div>
                      <div className="text-asteroid-gray text-sm">
                        ${fuel.cost} • {fuel.efficiency}% efficiency
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getEfficiencyBg(fuel.efficiency)} ${getEfficiencyColor(fuel.efficiency)}`}>
                        {fuel.efficiency}%
                      </div>
                      {isEditing && (
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditFuel(fuel);
                            }}
                            className="p-1 text-asteroid-gray hover:text-blue-400 transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFuel(fuel.id || fuel.name);
                            }}
                            className="p-1 text-asteroid-gray hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add/Edit Fuel Form */}
            {isEditing && (
              <div className="border-t border-white/10 pt-4">
                <h4 className="text-white font-medium mb-3">
                  {editingFuel ? 'Edit Fuel Type' : 'Add New Fuel Type'}
                </h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Fuel name"
                    value={newFuel.name}
                    onChange={(e) => setNewFuel({...newFuel, name: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-asteroid-gray focus:border-nebula-purple focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Cost ($)"
                      value={newFuel.cost || ''}
                      onChange={(e) => setNewFuel({...newFuel, cost: parseFloat(e.target.value) || 0})}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-asteroid-gray focus:border-nebula-purple focus:outline-none"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Efficiency (%)"
                      value={newFuel.efficiency || ''}
                      onChange={(e) => setNewFuel({...newFuel, efficiency: parseFloat(e.target.value) || 0})}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-asteroid-gray focus:border-nebula-purple focus:outline-none"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={editingFuel ? handleUpdateFuel : handleAddFuel}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-nebula-purple text-white rounded-lg hover:bg-nebula-purple/80 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>{editingFuel ? 'Update' : 'Add'}</span>
                    </button>
                    {editingFuel && (
                      <button
                        onClick={() => {
                          setEditingFuel(null);
                          setNewFuel({ name: '', cost: 0, efficiency: 0 });
                        }}
                        className="px-3 py-2 bg-asteroid-gray/20 text-asteroid-gray rounded-lg hover:bg-asteroid-gray/30 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelManager;
