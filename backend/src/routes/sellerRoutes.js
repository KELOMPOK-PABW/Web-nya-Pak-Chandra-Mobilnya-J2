const express = require("express");
const router = express.Router();
const sellerProductController = require("../controller/sellerProductController");
const sellerOrderController = require("../controller/sellerOrderController");
const sellerApplicationController = require("../controller/sellerApplicationController");

// Seller Products
router.get("/products", sellerProductController.getMyProducts);
router.post("/products", sellerProductController.createProduct);
router.put("/products/:id", sellerProductController.updateProduct);
router.delete("/products/:id", sellerProductController.deleteProduct);

// Seller Orders (from HEAD)
router.get("/orders", sellerOrderController.getOrders);
router.put("/orders/:orderItemId/process", sellerOrderController.processOrder);
router.put("/orders/:orderItemId/ready-to-ship", sellerOrderController.readyToShip);

// Seller Application
router.post("/apply", sellerApplicationController.apply);
router.get("/application/me", sellerApplicationController.getMyApplication);
router.get("/application", sellerApplicationController.getApplications);
router.put("/application/:id/approve", sellerApplicationController.approve);
router.put("/application/:id/reject", sellerApplicationController.reject);

module.exports = router;
