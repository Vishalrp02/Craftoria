const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getOrderById, getAllOrders } = require('../controllers/orderController');
const { auth, admin } = require('../middleware/auth');

router.post('/', auth, createOrder);
router.get('/myorders', auth, getUserOrders);
router.get('/', auth, admin, getAllOrders);
router.get('/:id', auth, getOrderById);

module.exports = router; 