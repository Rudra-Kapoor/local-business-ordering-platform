const Order = require("../models/Order");
const Product = require("../models/Product");
const Shop = require("../models/Shop");

const createOrder = async (req, res) => {
  try {
    const { shopId, items, deliveryAddress } = req.body;

    if (!shopId || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "shopId and at least one item are required" });
    }
    if (!deliveryAddress || !String(deliveryAddress).trim()) {
      return res.status(400).json({ message: "deliveryAddress is required" });
    }

    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    let totalAmount = 0;
    const orderItems = items.map((item) => {
      const product = productMap.get(String(item.productId));
      if (!product) {
        throw new Error("Invalid product in order");
      }
      if (String(product.shopId) !== String(shopId)) {
        const err = new Error("All items must be from the same shop");
        err.statusCode = 400;
        throw err;
      }
      const quantity = item.quantity || 1;
      totalAmount += product.price * quantity;
      return {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
      };
    });

    const order = await Order.create({
      userId: req.user._id,
      shopId,
      products: orderItems,
      totalAmount,
      status: "pending",
      paymentStatus: "pending",
      deliveryAddress: String(deliveryAddress).trim(),
    });

    return res.status(201).json(order);
  } catch (err) {
    console.error("Create order error", err);
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json(orders);
  } catch (err) {
    console.error("Get my orders error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getShopOrders = async (req, res) => {
  try {
    const { shopId } = req.params;
    const shop = await Shop.findOne({ _id: shopId, ownerId: req.user._id });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    const orders = await Order.find({ shopId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error("Get shop orders error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getOwnerOrders = async (req, res) => {
  try {
    const shops = await Shop.find({ ownerId: req.user._id }).select("_id shopName category location");
    const shopIds = shops.map((s) => s._id);
    const orders = await Order.find({ shopId: { $in: shopIds } })
      .populate("userId", "name email")
      .populate("shopId", "shopName category location")
      .sort({ createdAt: -1 });
    return res.json({ shops, orders });
  } catch (err) {
    console.error("Get owner orders error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const existing = await Order.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Order not found" });
    }
    const shop = await Shop.findOne({ _id: existing.shopId, ownerId: req.user._id });
    if (!shop) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const order = await Order.findByIdAndUpdate(id, { status, paymentStatus }, { new: true })
      .populate("userId", "name email")
      .populate("shopId", "shopName category location");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Emit real-time update events to user and shop rooms
    const io = req.app.get("io");
    if (io) {
      const userRoom = `user:${order.userId}`;
      const shopRoom = `shop:${order.shopId}`;
      io.to(userRoom).emit("orderUpdated", order);
      io.to(shopRoom).emit("orderUpdated", order);
    }

    return res.json(order);
  } catch (err) {
    console.error("Update order status error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getShopOrders,
  getOwnerOrders,
  updateOrderStatus,
};

