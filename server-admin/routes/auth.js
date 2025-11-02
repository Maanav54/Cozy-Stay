const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// POST /admin/auth/login
router.post('/login', async (req, res) => {
  let { email, password } = req.body || {};
  if(typeof email === 'string') email = email.trim().toLowerCase();
  // For demo: if a user exists with role 'admin' and password matches, issue token.
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // In production store hashed password. This example supports unhashed or hashed.
    const passwordMatches = (user.password === password) || await bcrypt.compare(password, user.password || '');
    if (!passwordMatches) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.role !== 'admin') return res.status(403).json({ error: 'Not an admin' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.ADMIN_JWT_SECRET || 'adminsecret', { expiresIn: '8h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dev-only: POST /admin/auth/seed - create or update an admin user
// Enabled for development
router.post('/seed', async (req, res) => {
  try {
    let { email, password, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    email = String(email).trim().toLowerCase();
    name = name || 'Dev Admin';
    const hashed = await bcrypt.hash(password, 10);
    const updated = await User.findOneAndUpdate(
      { email },
      { $set: { name, password: hashed, role: 'admin' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.json({ message: 'Admin seeded', email: updated.email });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
