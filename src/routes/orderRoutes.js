const express = require("express");
const {
  createOrder,
  getMyOrders,
  getShopOrders,
  updateOrderStatus,
} = require("../controllers/OrderController");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

// Customer: create order and view own orders
router.post("/", auth, authorize("customer"), createOrder);
router.get("/my", auth, authorize("customer"), getMyOrders);

// Shop owner: view orders for a shop and update status
router.get(
  "/shop/:shopId",
  auth,
  authorize("shopOwner"),
  getShopOrders
);
router.patch(
  "/:id/status",
  auth,
  authorize("shopOwner"),
  updateOrderStatus
);

module.exports = router;

