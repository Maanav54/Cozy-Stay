const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const path = require('path');
const roomsRoutes = require('./routes/rooms');
const usersRoutes = require('./routes/users');
const paymentsRoutes = require('./routes/payments');
const authRoutes = require('./routes/auth');
const reviewsRoutes = require('./routes/reviews');
const bookingsRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.ADMIN_PORT || 4000;
// Use the shared DB URI (fall back to environment MONGO_URI or default hotelmgmt)
const MONGO_URI = process.env.MONGO_URI || process.env.ADMIN_DB_URI || 'mongodb://127.0.0.1:27017/hotelmgmt';

app.use(cors());
app.use(bodyParser.json());

// Serve admin frontend static files (frontend/admin)
app.use(express.static(path.join(__dirname, '..', 'frontend', 'admin')));

// API routes (protected by middleware where appropriate)
app.use('/admin/auth', authRoutes);
app.use('/admin/rooms', roomsRoutes);
app.use('/admin/users', usersRoutes);
app.use('/admin/payments', paymentsRoutes);
app.use('/admin/reviews', reviewsRoutes);
app.use('/admin/bookings', bookingsRoutes);

// Root endpoint for quick verification
app.get('/', (req, res) => {
  // If static index.html exists in frontend/admin, express.static will already serve it.
  res.sendFile(path.join(__dirname, '..', 'frontend', 'admin', 'index.html'));
});

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Admin DB connected');
    app.listen(PORT, () => console.log(`Admin server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Admin DB connection error', err);
  });
