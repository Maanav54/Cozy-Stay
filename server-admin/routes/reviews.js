const express = require('express');
const router = express.Router();
const Review = require('../../models/Review');
const protect = require('../middleware/protect');

// List reviews (optionally filter by room)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.room) filter.room = req.query.room;
    const reviews = await Review.find(filter).sort({ createdAt: -1 }).lean();
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete a review (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Review.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ error: 'Review not found' });
    res.json({ success: true, deleted: id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
