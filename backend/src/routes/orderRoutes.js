const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");

router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.get("/:id/items", orderController.getOrderItems);

module.exports = router;
