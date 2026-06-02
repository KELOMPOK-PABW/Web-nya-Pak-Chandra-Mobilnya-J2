const express = require("express");
const router = express.Router();
const chatController = require("../controller/chatController");

router.post("/messages", chatController.sendMessage);
router.get("/sessions", chatController.getSessions);
router.get("/sessions/:sessionId/messages", chatController.getMessages);

module.exports = router;
