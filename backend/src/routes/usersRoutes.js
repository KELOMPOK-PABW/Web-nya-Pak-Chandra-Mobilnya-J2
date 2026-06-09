const express = require("express")
const route = express.Router()
const usersController = require("../controller/userController")
const addressController = require("../controller/addressController")

route.get("/", usersController.getAllUser)

// Addresses
route.get("/addresses", addressController.getAll);
route.post("/addresses", addressController.create);
route.put("/addresses/:id", addressController.update);
route.delete("/addresses/:id", addressController.deleteById);

module.exports = route