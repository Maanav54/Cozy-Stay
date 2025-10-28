const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bookingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  room: { type: Schema.Types.ObjectId, ref: 'Room' },
  fullName: String,
  email: String,
  phone: String,
  checkIn: Date,
  checkOut: Date,
  guests: Number,
  totalPrice: Number,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Booking', bookingSchema);
