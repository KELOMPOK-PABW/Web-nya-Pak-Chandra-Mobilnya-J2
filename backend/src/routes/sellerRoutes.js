const express = require("express");
const router = express.Router();
const sellerProductController = require("../controller/sellerProductController");
const sellerApplicationController = require("../controller/sellerApplicationController");

router.get("/products", sellerProductController.getMyProducts);
router.post("/products", sellerProductController.createProduct);
router.put("/products/:id", sellerProductController.updateProduct);
router.delete("/products/:id", sellerProductController.deleteProduct);

// Seller Application Routes
router.post("/apply", sellerApplicationController.apply);
router.get("/application", sellerApplicationController.getApplications);
router.put("/application/:id/approve", sellerApplicationController.approve);
router.put("/application/:id/reject", sellerApplicationController.reject);

module.exports = router;
