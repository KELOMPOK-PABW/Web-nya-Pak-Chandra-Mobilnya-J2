const express = require("express");
const route = express.Router();
const authController = require("../controller/authController");

route.post("/register", authController.register);
route.post("/login", authController.login);

module.exports = route;
