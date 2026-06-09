const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const sellerApplicationController = require("../controller/sellerApplicationController");

// User management
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserDetail);
router.put("/users/:id/ban", adminController.banUser);
router.put("/users/:id/unban", adminController.unbanUser);
router.put("/users/:id/role", adminController.changeUserRole);

// Seller applications
router.get("/seller-applications", sellerApplicationController.getApplications);
router.put("/seller-applications/:id/approve", sellerApplicationController.approve);
router.put("/seller-applications/:id/reject", sellerApplicationController.reject);

module.exports = router;
