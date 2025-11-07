const { getUserCollection } = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = getUserCollection(db);
    const { name, email, password } = req.body;
    const userExists = await users.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ name, email, password: hashedPassword, isAdmin: false, wishlist: [] });
    const user = result.ops ? result.ops[0] : await users.findOne({ _id: result.insertedId });
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = getUserCollection(db);
    const { email, password } = req.body;
    const user = await users.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 