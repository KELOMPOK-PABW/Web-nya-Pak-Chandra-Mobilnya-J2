const express = require("express");
const router = express.Router();
const sellerProductController = require("../controller/sellerProductController");

router.get("/products", sellerProductController.getMyProducts);
router.post("/products", sellerProductController.createProduct);
router.put("/products/:id", sellerProductController.updateProduct);
router.delete("/products/:id", sellerProductController.deleteProduct);

module.exports = router;
