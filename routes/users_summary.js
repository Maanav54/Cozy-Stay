const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// GET /api/users/summary - returns booking count, total spent and last booking date for current user
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId }).sort({ createdAt: -1 });
    const totalBookings = bookings.length;
    const totalSpent = bookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
    const lastBooking = bookings.length ? bookings[0].createdAt : null;
    res.json({ totalBookings, totalSpent, lastBooking });
  } catch(e){
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
