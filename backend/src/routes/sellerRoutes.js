const express = require("express");
const router = express.Router();
const sellerProductController = require("../controller/sellerProductController");
const sellerOrderController = require("../controller/sellerOrderController");

router.get("/orders", sellerOrderController.getSellerOrders);
router.get("/orders/:id", sellerOrderController.getSellerOrderById);
router.put("/orders/:id/process", sellerOrderController.processOrder);
router.put("/orders/:id/ready-to-ship", sellerOrderController.readyToShipOrder);

router.get("/products", sellerProductController.getMyProducts);
router.post("/products", sellerProductController.createProduct);
router.put("/products/:id", sellerProductController.updateProduct);
router.delete("/products/:id", sellerProductController.deleteProduct);

module.exports = router;
