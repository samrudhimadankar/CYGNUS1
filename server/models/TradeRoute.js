const mongoose = require('mongoose');

const tradeRouteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sourceSystem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StarSystem',
    required: true
  },
  destinationSystem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StarSystem',
    required: true
  },
  waypoints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StarSystem'
  }],
  distance: {
    type: Number,
    required: true
  },
  fuelCost: {
    type: Number,
    required: true
  },
  tradeValue: {
    type: Number,
    required: true
  },
  profit: {
    type: Number,
    required: true
  },
  isOptimal: {
    type: Boolean,
    default: false
  },
  routeType: {
    type: String,
    enum: ['direct', 'hub', 'multi-hop'],
    required: true
  },
  cargo: [{
    resourceName: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Calculate total route value
tradeRouteSchema.methods.calculateTotalValue = function() {
  return this.cargo.reduce((total, item) => total + (item.amount * item.price), 0);
};

// Calculate efficiency score
tradeRouteSchema.methods.calculateEfficiency = function() {
  if (this.fuelCost === 0) return 0;
  return this.tradeValue / this.fuelCost;
};

module.exports = mongoose.model('TradeRoute', tradeRouteSchema);
