const express = require("express");
const router = express.Router();
const chatController = require("../controller/chatController");

router.post("/chat", chatController.llmChat);

module.exports = router;
