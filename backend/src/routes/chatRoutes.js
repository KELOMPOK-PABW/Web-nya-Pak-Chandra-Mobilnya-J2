const express = require("express");
const router = express.Router();
const chatController = require("../controller/chatController");

router.post("/messages", chatController.sendMessage);
router.get("/sessions", chatController.getSessions);
router.post("/sessions", chatController.createSession);
router.get("/sessions/:sessionId/messages", chatController.getMessages);
router.delete("/sessions/:sessionId", chatController.deleteSession);

module.exports = router;
