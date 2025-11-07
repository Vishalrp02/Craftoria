const { getOrderCollection } = require("../models/Order");
const { ObjectId } = require("mongodb");

exports.createOrder = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const orders = getOrderCollection(db);
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentId,
      isPaid,
      paymentResult,
    } = req.body;
    // Ensure all orderItems have product as a string
    const safeOrderItems = (orderItems || []).map((item) => ({
      ...item,
      product: String(item.product),
    }));
    const orderDoc = {
      user: req.user.id,
      orderItems: safeOrderItems,
      shippingAddress, // now expects an object
      paymentMethod,
      totalPrice,
      isPaid: !!(isPaid || paymentId),
      paidAt: isPaid || paymentId ? new Date() : undefined,
      paymentResult:
        paymentResult ||
        (paymentId ? { id: paymentId, status: "success" } : undefined),
      isDelivered: false,
      createdAt: new Date(),
    };
    // Remove undefined fields
    Object.keys(orderDoc).forEach(
      (key) => orderDoc[key] === undefined && delete orderDoc[key]
    );
    const result = await orders.insertOne(orderDoc);
    const order = result.ops
      ? result.ops[0]
      : await orders.findOne({ _id: result.insertedId });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const orders = await getOrderCollection(db)
      .find({ user: req.user.id })
      .toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const order = await getOrderCollection(db).findOne({
      _id: ObjectId(req.params.id),
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const orders = await getOrderCollection(db).find().toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
