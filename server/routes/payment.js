const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

router.post('/create-order', auth, createOrder);

module.exports = router; 