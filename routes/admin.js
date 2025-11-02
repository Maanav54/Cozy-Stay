const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Room = require('../models/Room');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// store uploads in public/images
const uploadDir = path.join(__dirname, '..', 'public', 'images');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + Date.now() + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

// Upload a single image and assign to a room type or specific room
// form fields: type (e.g. 'Normal') OR roomId
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if(!req.file) return res.status(400).json({ message: 'No file' });
    const relPath = '/images/' + req.file.filename;
    const { type, roomId } = req.body;
    if(roomId){
      const room = await Room.findByIdAndUpdate(roomId, { $set: { image: relPath } }, { new: true });
      return res.json({ updated: 1, room });
    }
    if(type){
      const result = await Room.updateMany({ type }, { $set: { image: relPath } });
      return res.json({ updated: result.modifiedCount || result.nModified || result.n || 0, path: relPath });
    }
    return res.json({ path: relPath });
  } catch(e){
    console.error(e);
    res.status(500).json({ message: e.message });
  }
});

// Admin Routes for User Management
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash').sort('-createdAt');
    res.json(users);
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const { name, email, phone, address, isAdmin } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { name, email, phone, address, isAdmin },
      { new: true }
    ).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

// Admin Routes for Room Management
router.get('/rooms', auth, isAdmin, async (req, res) => {
  try {
    const rooms = await Room.find().sort('-createdAt');
    res.json(rooms);
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/rooms', auth, isAdmin, async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/rooms/:id', auth, isAdmin, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/rooms/:id', auth, isAdmin, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

// Admin Routes for Booking Management
router.get('/bookings', auth, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('room user').sort('-createdAt');
    res.json(bookings);
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

// Admin Routes for Review Management
router.get('/reviews', auth, isAdmin, async (req, res) => {
  try {
    const reviews = await Review.find().sort('-createdAt');
    res.json(reviews);
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/reviews/:id', auth, isAdmin, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
