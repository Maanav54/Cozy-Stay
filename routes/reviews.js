const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get all reviews (optionally filter by room via ?room=ROOMID)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if(req.query.room) filter.room = req.query.room;
    const reviews = await Review.find(filter).sort({ createdAt: -1 }).lean();
    res.json(reviews);
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

// Post a review (requires auth)
router.post('/', auth, async (req, res) => {
  try {
    const { rating, comment, room } = req.body;
    if(!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1-5' });
    // find user name
    const user = await User.findById(req.user.id);
    const name = user ? user.name : (req.body.name || 'Anonymous');
    const review = new Review({ user: req.user.id, name, rating, comment, room });
    await review.save();
    res.json(review);
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
