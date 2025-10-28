const express = require('express');
const router = express.Router();
const Booking = require('../../models/Booking');
const protect = require('../middleware/protect');

// Admin: list all bookings (protected by admin JWT)
router.get('/', protect, async (req, res) => {
  try {
    const all = await Booking.find().populate('room user').sort({ createdAt: -1 }).lean();
    res.json(all);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Optionally expose a delete booking endpoint for admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Booking.findByIdAndDelete(id);
    if(!doc) return res.status(404).json({ error: 'Booking not found' });
    res.json({ success: true, deleted: id });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
