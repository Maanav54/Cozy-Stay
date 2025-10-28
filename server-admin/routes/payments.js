const express = require('express');
const router = express.Router();
const controller = require('../controllers/paymentsController');
const protect = require('../middleware/protect');

router.use(protect);

router.get('/', controller.listPayments);

module.exports = router;
