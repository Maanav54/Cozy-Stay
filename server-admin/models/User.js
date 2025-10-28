const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String, // store hashed passwords in production
  role: { type: String, enum: ['admin','staff','guest'], default: 'guest' },
}, { timestamps: true });

// Register this model under the shared name 'User' and map to the existing 'users' collection
// so populate('user') from Booking and other models works across admin and main servers.
module.exports = mongoose.model('User', UserSchema, 'users');
