const express = require("express");
const route = express.Router();
const paymentController = require("../controller/paymentController");

route.get("/:order_id", paymentController.getByOrderId);
route.post("/", paymentController.createPayment);
route.post("/:id/pay", paymentController.pay);

module.exports = route;
