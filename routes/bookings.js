const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const auth = require('../middleware/auth');

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const { roomId, fullName, email, phone, checkIn, checkOut, guests } = req.body;
    const room = await Room.findById(roomId);
    if(!room) return res.status(404).json({ message: 'Room not found' });
    if(room.available <= 0) return res.status(400).json({ message: 'No availability' });
    // naive date difference
    const days = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000*60*60*24)));
    const totalPrice = days * room.price;
    const booking = new Booking({
      user: req.user.id,
      room: room._id,
      fullName, email, phone, checkIn, checkOut, guests, totalPrice
    });
    await booking.save();
    room.available = room.available - 1;
    await room.save();
    res.json({ booking });
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

// Get bookings for user
router.get('/mine', auth, async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id }).populate('room');
  res.json(bookings);
});

// Admin: all bookings
router.get('/', auth, async (req, res) => {
  const all = await Booking.find().populate('room user');
  res.json(all);
});

module.exports = router;
