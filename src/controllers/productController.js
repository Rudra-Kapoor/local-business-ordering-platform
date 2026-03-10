const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {
    const { shopId, name, description, price, stock, category } = req.body;

    if (!shopId || !name || price == null || stock == null) {
      return res
        .status(400)
        .json({ message: "shopId, name, price and stock are required" });
    }

    const product = await Product.create({
      shopId,
      name,
      description,
      price,
      stock,
      category,
    });

    return res.status(201).json(product);
  } catch (err) {
    console.error("Create product error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(product);
  } catch (err) {
    console.error("Update product error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("Delete product error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const listProductsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const products = await Product.find({ shopId, isActive: true });
    return res.json(products);
  } catch (err) {
    console.error("List products error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  listProductsByShop,
};

