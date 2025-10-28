const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  room: { type: Schema.Types.ObjectId, ref: 'Room' }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
