const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const auth = require('../middleware/auth');

// Create sample rooms (admin convenience)
router.post('/seed', async (req, res) => {
  try {
    const samples = [
      { 
        title: 'Deluxe Room', 
        type: 'Deluxe', 
        description: 'Spacious deluxe with balcony', 
        price: 3000, 
        total: 5, 
        available: 5,
        image: '/images/deluxe.jpg'
      },
      { 
        title: 'Super Deluxe Room', 
        type: 'Super Deluxe', 
        description: 'Extra space & amenities', 
        price: 4500, 
        total: 3, 
        available: 3,
        image: '/images/super.jpg'
      },
      { 
        title: 'Normal Room', 
        type: 'Normal', 
        description: 'Comfortable and affordable', 
        price: 1800, 
        total: 8, 
        available: 8,
        image: '/images/normal.jpg'
      },
      { 
        title: 'Below Average Room', 
        type: 'Below Average', 
        description: 'Budget option', 
        price: 900, 
        total: 4, 
        available: 4,
        image: '/images/below.jpg'
      }
    ];
    await Room.deleteMany({});
    const created = await Room.insertMany(samples);
    res.json({ created });
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

// Get all rooms
router.get('/', async (req, res) => {
  const rooms = await Room.find().sort({ type: 1 });
  res.json(rooms);
});

// Get single room
router.get('/:id', async (req, res) => {
  const room = await Room.findById(req.params.id);
  if(!room) return res.status(404).json({ message: 'Not found' });
  res.json(room);
});

// Admin update room
router.put('/:id', auth, async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(room);
});

module.exports = router;
