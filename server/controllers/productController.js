const { getProductCollection } = require('../models/Product');
const { ObjectId } = require('mongodb');

exports.getProducts = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const products = await getProductCollection(db).find().toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const product = await getProductCollection(db).findOne({ _id: new ObjectId(req.params.id) });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await getProductCollection(db).insertOne(req.body);
    const product = result.ops ? result.ops[0] : await getProductCollection(db).findOne({ _id: result.insertedId });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await getProductCollection(db).findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ message: 'Product not found' });
    res.json(result.value);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await getProductCollection(db).deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addProductReview = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const products = getProductCollection(db);
    const orders = require('../models/Order').getOrderCollection(db);
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;
    const userName = req.user.name || 'User';
    // Find product
    const product = await products.findOne({ _id: new ObjectId(productId) });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    // Check if user already reviewed
    if ((product.reviews || []).some(r => r.user?.toString() === userId)) {
      return res.status(400).json({ message: 'Product already reviewed by this user' });
    }
    // Check if user has purchased this product (has a paid order with this product)
    const hasPurchased = await orders.findOne({
      user: userId,
      isPaid: true,
      'orderItems.product': productId
    });
    if (!hasPurchased) {
      return res.status(403).json({ message: 'You can only review products you have purchased.' });
    }
    // Add review
    const review = {
      user: new ObjectId(userId),
      name: userName,
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date()
    };
    const updatedReviews = [...(product.reviews || []), review];
    const numReviews = updatedReviews.length;
    const avgRating = updatedReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / numReviews;
    await products.updateOne(
      { _id: new ObjectId(productId) },
      { $set: { reviews: updatedReviews, numReviews, rating: avgRating } }
    );
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 