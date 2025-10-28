const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const roomSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  total: { type: Number, default: 1 },
  available: { type: Number, default: 1 },
  image: String
}, { timestamps: true });

// Auto-assign default image path based on room type when not provided
roomSchema.pre('save', function(next){
  if(this.image) return next();
  const map = {
    'Normal': '/images/normal.jpg',
    'Below Average': '/images/below.jpg',
    'Deluxe': '/images/deluxe.jpg',
    'Super Deluxe': '/images/super.jpg'
  };
  const key = this.type || '';
  if(map[key]) this.image = map[key];
  next();
});
module.exports = mongoose.model('Room', roomSchema);
