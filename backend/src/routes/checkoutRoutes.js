const express = require("express")
const router = express.Router()
const checkoutController = require("../controller/checkoutController")

router.post("/", checkoutController.checkout)

module.exports = router