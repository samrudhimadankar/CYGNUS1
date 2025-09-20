const express = require('express');
const router = express.Router();
const StarSystem = require('../models/StarSystem');
const { body, validationResult } = require('express-validator');

// @route   GET /api/starsystems
// @desc    Get all star systems
// @access  Public
router.get('/', async (req, res) => {
  try {
    const starSystems = await StarSystem.find().sort({ name: 1 });
    res.json(starSystems);
  } catch (error) {
    console.error('Error fetching star systems:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/starsystems/:id
// @desc    Get single star system
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const starSystem = await StarSystem.findById(req.params.id);
    if (!starSystem) {
      return res.status(404).json({ message: 'Star system not found' });
    }
    res.json(starSystem);
  } catch (error) {
    console.error('Error fetching star system:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/starsystems
// @desc    Create new star system
// @access  Public
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('coordinates.x').isNumeric().withMessage('X coordinate must be a number'),
  body('coordinates.y').isNumeric().withMessage('Y coordinate must be a number'),
  body('coordinates.z').isNumeric().withMessage('Z coordinate must be a number'),
  body('population').isNumeric().withMessage('Population must be a number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const starSystem = new StarSystem(req.body);
    await starSystem.save();
    res.status(201).json(starSystem);
  } catch (error) {
    console.error('Error creating star system:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Star system with this name already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// @route   PUT /api/starsystems/:id
// @desc    Update star system
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const starSystem = await StarSystem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!starSystem) {
      return res.status(404).json({ message: 'Star system not found' });
    }
    
    res.json(starSystem);
  } catch (error) {
    console.error('Error updating star system:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/starsystems/:id
// @desc    Delete star system
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const starSystem = await StarSystem.findByIdAndDelete(req.params.id);
    if (!starSystem) {
      return res.status(404).json({ message: 'Star system not found' });
    }
    res.json({ message: 'Star system deleted successfully' });
  } catch (error) {
    console.error('Error deleting star system:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/starsystems/bulk
// @desc    Create multiple star systems from CSV data
// @access  Public
router.post('/bulk', async (req, res) => {
  try {
    const { starSystems } = req.body;
    
    if (!Array.isArray(starSystems)) {
      return res.status(400).json({ message: 'Expected array of star systems' });
    }

    const createdSystems = await StarSystem.insertMany(starSystems, { ordered: false });
    res.status(201).json({ 
      message: `Successfully created ${createdSystems.length} star systems`,
      systems: createdSystems 
    });
  } catch (error) {
    console.error('Error creating bulk star systems:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
