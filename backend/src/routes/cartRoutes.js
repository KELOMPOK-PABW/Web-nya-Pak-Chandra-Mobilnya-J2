const express = require("express");
const router = express.Router();
const cartController = require("../controller/cartController");

router.get("/cart", cartController.getCart);
router.post("/cart/items", cartController.addItem);
router.put("/cart/items/:id",cartController.updateCartItem)
router.delete("/cart/items/:id", cartController.deleteCartItem)
router.delete("/cart", cartController.clearCart)

module.exports = router;