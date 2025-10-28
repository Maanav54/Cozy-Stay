const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  number: { type: String, required: false },
  title: { type: String },
  type: { type: String },
  price: { type: Number },
  total: { type: Number },
  available: { type: Number },
  description: { type: String },
  image: { type: String },
  status: { type: String, enum: ['clean','dirty','occupied','available'], default: 'available' },
  meta: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

// Use the existing 'rooms' collection in the shared DB so admin reads real room data
module.exports = mongoose.model('Room', RoomSchema, 'rooms');
