const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  availability: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const consumptionSchema = new mongoose.Schema({
  resourceName: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
});

const starSystemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  coordinates: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    z: {
      type: Number,
      required: true
    }
  },
  population: {
    type: Number,
    required: true,
    min: 0
  },
  resources: [resourceSchema],
  consumption: [consumptionSchema],
  isTradeHub: {
    type: Boolean,
    default: false
  },
  economicGrowth: {
    type: Number,
    default: 0,
    min: -100,
    max: 100
  },
  fuelStation: {
    available: {
      type: Boolean,
      default: true
    },
    price: {
      type: Number,
      default: 1.0
    },
    fuelTypes: [{
      name: {
        type: String,
        required: true
      },
      cost: {
        type: Number,
        required: true,
        min: 0
      },
      efficiency: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      }
    }]
  }
}, {
  timestamps: true
});

// Calculate distance between two star systems
starSystemSchema.methods.calculateDistance = function(otherSystem) {
  const dx = this.coordinates.x - otherSystem.coordinates.x;
  const dy = this.coordinates.y - otherSystem.coordinates.y;
  const dz = this.coordinates.z - otherSystem.coordinates.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

// Calculate trade value based on resources and population
starSystemSchema.methods.calculateTradeValue = function() {
  const resourceValue = this.resources.reduce((total, resource) => 
    total + (resource.availability * resource.price), 0);
  return resourceValue * (this.population / 1000000); // Scale by population
};

module.exports = mongoose.model('StarSystem', starSystemSchema);
