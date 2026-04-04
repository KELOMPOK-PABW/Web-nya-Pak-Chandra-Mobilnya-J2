const express = require("express");
const router = express.Router();
const cartController = require("../controller/cartController");

router.get("/cart", cartController.getCart);
router.post("/cart/items", cartController.addItem);

module.exports = router;