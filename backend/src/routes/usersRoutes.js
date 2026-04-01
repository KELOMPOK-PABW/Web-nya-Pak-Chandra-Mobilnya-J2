const express = require("express")

const route = express.Router()
const usersController = require("../controller/userController")

route.get("/", usersController.getAllUser)

module.exports = route