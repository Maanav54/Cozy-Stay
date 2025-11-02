const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const userSummary = require('./routes/users_summary');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to local MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotelmgmt';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('Connected to MongoDB:', MONGO_URI))
  .catch(err => console.error('MongoDB connection error:', err));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', userSummary);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// Note: booking lists are provided by the authenticated bookings API at /api/bookings.

// Serve backend public assets (images, admin UI)
app.use('/assets', express.static(path.join(__dirname, 'public')));
// Also expose images at /images so existing Room.image paths (e.g. /images/normal.jpg) work
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Serve static frontend (single-page app)
app.use('/', express.static(path.join(__dirname, 'frontend')));

// Fallback to frontend's index.html for SPA routes
app.get('*', (req, res) => {
  // If the request is for an asset in /assets, let static middleware above serve it
  if(req.path.startsWith('/assets/')) return res.status(404).end();
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Note: removed mock /bookings endpoint to ensure admin UI uses real booking data (if available).

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log('Server running on port', PORT));
