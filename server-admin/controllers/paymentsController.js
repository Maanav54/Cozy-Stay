const Payment = require('../models/Payment');

exports.listPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('userId', 'name email');
    res.json(payments);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
