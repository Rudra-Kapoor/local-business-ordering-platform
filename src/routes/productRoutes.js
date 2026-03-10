const express = require("express");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  listProductsByShop,
} = require("../controllers/productController");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

// Customer: list products for a shop
router.get("/shop/:shopId", listProductsByShop);

// Shop owner: manage products
router.post("/", auth, authorize("shopOwner"), createProduct);
router.put("/:id", auth, authorize("shopOwner"), updateProduct);
router.delete("/:id", auth, authorize("shopOwner"), deleteProduct);

module.exports = router;

