const express = require("express");
const router = express.Router();
const walletController = require("../controller/walletController");

router.get("/", walletController.getBalance);
router.get("/transactions", walletController.getTransactions);
router.post("/topup", walletController.topup);
router.post("/refund", walletController.refund);

module.exports = router;
