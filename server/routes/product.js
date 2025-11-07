const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, admin } = require('../middleware/auth');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', auth, admin, productController.createProduct);
router.put('/:id', auth, admin, productController.updateProduct);
router.delete('/:id', auth, admin, productController.deleteProduct);
router.post('/:id/reviews', auth, productController.addProductReview);

module.exports = router; 