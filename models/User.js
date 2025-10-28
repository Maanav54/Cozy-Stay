const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
