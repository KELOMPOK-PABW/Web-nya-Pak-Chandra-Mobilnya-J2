const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");
const reviewController = require("../controller/reviewController");

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.get("/:id/reviews", reviewController.getProductReviews);
router.get("/:id/rating", reviewController.getProductRating);

module.exports = router;
