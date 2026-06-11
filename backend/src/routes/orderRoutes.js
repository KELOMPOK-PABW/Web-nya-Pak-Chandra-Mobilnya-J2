const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");

router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.get("/:id/items", orderController.getOrderItems);
router.get("/:id/history", orderController.getOrderHistory);
router.put("/:id/cancel", orderController.cancelOrder);
router.put("/:id/confirm", orderController.confirmOrder);

module.exports = router;
