const { getCartCollection } = require('../models/Cart');
const { ObjectId } = require('mongodb');

exports.getCart = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const carts = getCartCollection(db);
    const cart = await carts.findOne({ user: req.user.id });
    res.json(cart || { cartItems: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const carts = getCartCollection(db);
    const { product, qty, price } = req.body;
    let cart = await carts.findOne({ user: req.user.id });
    if (!cart) {
      const result = await carts.insertOne({ user: req.user.id, cartItems: [{ product, qty, price }] });
      cart = result.ops ? result.ops[0] : await carts.findOne({ _id: result.insertedId });
    } else {
      const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === product);
      if (itemIndex > -1) {
        cart.cartItems[itemIndex].qty = qty; // Set to new qty
        cart.cartItems[itemIndex].price = price; // Optionally update price
      } else {
        cart.cartItems.push({ product, qty, price });
      }
      await carts.updateOne({ _id: cart._id }, { $set: { cartItems: cart.cartItems } });
    }
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const carts = getCartCollection(db);
    const { product } = req.body;
    let cart = await carts.findOne({ user: req.user.id });
    if (cart) {
      cart.cartItems = cart.cartItems.filter(item => item.product.toString() !== product);
      await carts.updateOne({ _id: cart._id }, { $set: { cartItems: cart.cartItems } });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const carts = getCartCollection(db);
    let cart = await carts.findOne({ user: req.user.id });
    if (cart) {
      await carts.updateOne({ _id: cart._id }, { $set: { cartItems: [] } });
    }
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 