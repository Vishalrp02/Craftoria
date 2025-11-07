const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Wishlist endpoints
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');

router.post('/register', register);
router.post('/login', login);
router.get('/wishlist', auth, getWishlist);
router.post('/wishlist', auth, addToWishlist);
router.delete('/wishlist', auth, removeFromWishlist);

module.exports = router; 