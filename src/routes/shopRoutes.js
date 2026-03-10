const express = require("express");
const {
  createShop,
  getMyShops,
  getNearbyShops,
  updateShop,
  adminListShops,
  verifyShop,
} = require("../controllers/shopController");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

// Customer: browse nearby shops
router.get("/", getNearbyShops);

// Shop owner: manage own shops
router.post("/", auth, authorize("shopOwner"), createShop);
router.get("/mine", auth, authorize("shopOwner"), getMyShops);
router.put("/:id", auth, authorize("shopOwner"), updateShop);

// Admin: manage and verify shops
router.get("/admin/all", auth, authorize("admin"), adminListShops);
router.patch("/admin/:id/verify", auth, authorize("admin"), verifyShop);

module.exports = router;

