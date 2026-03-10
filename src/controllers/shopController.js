const Shop = require("../models/Shop");

const createShop = async (req, res) => {
  try {
    const { shopName, location, category } = req.body;

    if (!shopName || !location || !location.address || !category) {
      return res.status(400).json({ message: "shopName, category and location.address are required" });
    }

    const shop = await Shop.create({
      shopName,
      ownerId: req.user._id,
      location,
      category,
    });

    return res.status(201).json(shop);
  } catch (err) {
    console.error("Create shop error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getMyShops = async (req, res) => {
  try {
    const shops = await Shop.find({ ownerId: req.user._id });
    return res.json(shops);
  } catch (err) {
    console.error("Get my shops error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getNearbyShops = async (req, res) => {
  try {
    const { category } = req.query;

    const query = { isActive: true, isVerified: true };
    if (category) {
      query.category = category;
    }

    const shops = await Shop.find(query).sort({ createdAt: -1 });
    return res.json(shops);
  } catch (err) {
    console.error("Get nearby shops error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateShop = async (req, res) => {
  try {
    const { id } = req.params;

    const shop = await Shop.findOneAndUpdate(
      { _id: id, ownerId: req.user._id },
      req.body,
      { new: true }
    );

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    return res.json(shop);
  } catch (err) {
    console.error("Update shop error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const adminListShops = async (req, res) => {
  try {
    const shops = await Shop.find().populate("ownerId", "name email");
    return res.json(shops);
  } catch (err) {
    console.error("Admin list shops error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const verifyShop = async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await Shop.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    );
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    return res.json(shop);
  } catch (err) {
    console.error("Verify shop error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createShop,
  getMyShops,
  getNearbyShops,
  updateShop,
  adminListShops,
  verifyShop,
};

