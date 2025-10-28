const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'verysecretkey';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if(!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const existing = await User.findOne({ email });
    if(existing) return res.status(400).json({ message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    // Make the first user an admin
    const isFirstUser = (await User.countDocuments({})) === 0;
    const user = new User({ name, email, passwordHash, phone, address, isAdmin: isFirstUser });
    await user.save();
    const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address } });
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address } });
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
