const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");

router.get("/", orderController.getAllOrders);
router.get("/:id/status-history", orderController.getStatusHistory);
router.get("/:id/items", orderController.getOrderItems);
router.put("/:id/cancel", orderController.cancelOrder);
router.put("/:id/confirm", orderController.confirmOrder);
router.put("/:orderItemId/complete", orderController.completeOrderItem);
router.get("/:id", orderController.getOrderById);

module.exports = router;
