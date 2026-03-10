const Order = require("../models/Order");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
  try {
    const { shopId, items, deliveryAddress } = req.body;

    if (!shopId || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "shopId and at least one item are required" });
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
      deliveryAddress,
    });

    return res.status(201).json(order);
  } catch (err) {
    console.error("Create order error", err);
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
    const orders = await Order.find({ shopId }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error("Get shop orders error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status, paymentStatus },
      { new: true }
    );

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
  updateOrderStatus,
};

