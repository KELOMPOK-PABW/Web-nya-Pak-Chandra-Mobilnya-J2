const express = require("express");
const router = express.Router();
const sellerProductController = require("../controller/sellerProductController");
const sellerOrderController = require("../controller/sellerOrderController");
const sellerApplicationController = require("../controller/sellerApplicationController");

router.get("/products", sellerProductController.getMyProducts);
router.post("/products", sellerProductController.createProduct);
router.put("/products/:id", sellerProductController.updateProduct);
router.delete("/products/:id", sellerProductController.deleteProduct);

// Seller orders
router.get("/orders", sellerOrderController.getOrders);
router.put("/orders/:orderItemId/process", sellerOrderController.processOrder);
router.put("/orders/:orderItemId/ready-to-ship", sellerOrderController.readyToShip);

// Seller application
router.post("/apply", sellerApplicationController.apply);
router.get("/application", sellerApplicationController.getMyApplication);

module.exports = router;
