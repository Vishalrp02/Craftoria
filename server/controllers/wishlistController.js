const { getUserCollection } = require('../models/User');
const { ObjectId } = require('mongodb');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = getUserCollection(db);
    const user = await users.findOne({ _id: new ObjectId(req.user.id) });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ wishlist: user.wishlist || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = getUserCollection(db);
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID required' });
    const user = await users.findOne({ _id: new ObjectId(req.user.id) });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if ((user.wishlist || []).includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    await users.updateOne(
      { _id: new ObjectId(req.user.id) },
      { $push: { wishlist: productId } }
    );
    res.json({ message: 'Added to wishlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = getUserCollection(db);
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID required' });
    await users.updateOne(
      { _id: new ObjectId(req.user.id) },
      { $pull: { wishlist: productId } }
    );
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 