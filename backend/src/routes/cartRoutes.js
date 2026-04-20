const express = require("express");
const router = express.Router();
const cartController = require("../controller/cartController");

router.get("/", cartController.getCart);
router.get("/validate", cartController.validateCart)
router.get("/count", cartController.countCartItems)
router.post("/items", cartController.addItem);
router.put("/items/:id",cartController.updateCartItem)
router.delete("/items/:id", cartController.deleteCartItem)
router.delete("/", cartController.clearCart)

module.exports = router;