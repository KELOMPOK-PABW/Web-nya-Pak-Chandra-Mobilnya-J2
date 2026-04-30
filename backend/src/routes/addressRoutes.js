const express = require("express");
const route = express.Router();
const addressController = require("../controller/addressController");

route.post("/", addressController.createAddress);
route.get("/", addressController.getAddresses);
route.get("/:id", addressController.getAddressById);
route.put("/:id", addressController.updateAddress);
route.delete("/:id", addressController.deleteAddress);

module.exports = route;
