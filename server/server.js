const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const dotenv = require("dotenv");

// Load env vars

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const client = new MongoClient(process.env.MONGO_URI, {
  useUnifiedTopology: true,
});
let db;

client
  .connect()
  .then(() => {
    db = client.db();
    app.locals.db = db;
    console.log("MongoDB connected");
    // Start server only after DB is ready
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// JWT Auth middleware stub
const jwt = require("jsonwebtoken");
const auth = (req, res, next) => {
  // TODO: Implement JWT auth
  next();
};

// Razorpay integration stub
const Razorpay = require("razorpay");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Example route
app.get("/", (req, res) => {
  res.send("API is running");
});

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const productRoutes = require("./routes/product");
app.use("/api/products", productRoutes);

const paymentRoutes = require("./routes/payment");
app.use("/api/payment", paymentRoutes);

const orderRoutes = require("./routes/order");
app.use("/api/orders", orderRoutes);
const cartRoutes = require("./routes/cart");
app.use("/api/cart", cartRoutes);
