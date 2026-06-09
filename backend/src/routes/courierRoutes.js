const express = require("express");
const router = express.Router();
const courierController = require("../controller/courierController");

router.get("/tasks", courierController.getTasks);
router.get("/tasks/:id", courierController.getTaskDetail);
router.put("/order-items/:id/pickup", courierController.pickup);
router.put("/order-items/:id/deliver", courierController.deliver);

module.exports = router;
