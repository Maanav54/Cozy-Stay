const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
  amount: Number,
  method: String,
  status: { type: String, enum: ['pending','completed','failed'], default: 'completed' },
  meta: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
