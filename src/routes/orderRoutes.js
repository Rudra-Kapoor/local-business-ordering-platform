const express = require("express");
const {
  createOrder,
  getMyOrders,
  getShopOrders,
  getOwnerOrders,
  getOrderChat,
  postOrderChat,
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
router.get("/owner/mine", auth, authorize("shopOwner"), getOwnerOrders);
router.patch(
  "/:id/status",
  auth,
  authorize("shopOwner"),
  updateOrderStatus
);

// Order chat: allowed for order's customer and shop's owner
router.get("/:id/chat", auth, getOrderChat);
router.post("/:id/chat", auth, postOrderChat);

module.exports = router;

