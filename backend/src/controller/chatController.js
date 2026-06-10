const chatService = require("../services/chatService");
const { sendMessageSchema, llmChatSchema, createSessionSchema } = require("../validations/chatValidation");

const errorStatus = (message) => {
  if (!message) return 400;
  if (message.startsWith("Akses ditolak")) return 403;
  if (message.includes("tidak ditemukan")) return 404;
  if (message.startsWith("Layanan AI")) return 503;
  if (message.startsWith("GEMINI_API_KEY")) return 500;
  return 400;
};

const sendMessage = async (req, res) => {
  const { error, value } = sendMessageSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  try {
    const result = await chatService.sendMessage({
      userId: req.user.id,
      sessionId: value.session_id,
      message: value.message,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (e) {
    return res.status(errorStatus(e.message)).json({ success: false, message: e.message });
  }
};

const llmChat = async (req, res) => {
  const { error, value } = llmChatSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  try {
    const result = await chatService.runLlmChat({
      userId: req.user.id,
      sessionId: value.session_id,
      message: value.message,
      history: value.history,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (e) {
    return res.status(errorStatus(e.message)).json({ success: false, message: e.message });
  }
};

const getSessions = async (req, res) => {
  try {
    const sessions = await chatService.getUserSessions(req.user.id);
    return res.status(200).json({ success: true, data: sessions });
  } catch (e) {
    return res.status(errorStatus(e.message)).json({ success: false, message: e.message });
  }
};

const createSession = async (req, res) => {
  const { error, value } = createSessionSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  try {
    const session = await chatService.createSession(req.user.id, value.title);
    return res.status(200).json({
      success: true,
      message: "Session berhasil dibuat",
      data: session,
    });
  } catch (e) {
    return res.status(errorStatus(e.message)).json({ success: false, message: e.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await chatService.getSessionMessages(req.user.id, req.params.sessionId);
    return res.status(200).json({ success: true, data: messages });
  } catch (e) {
    return res.status(errorStatus(e.message)).json({ success: false, message: e.message });
  }
};

const deleteSession = async (req, res) => {
  try {
    const result = await chatService.deleteSession(req.user.id, req.params.sessionId);
    return res.status(200).json({ success: true, data: result });
  } catch (e) {
    return res.status(errorStatus(e.message)).json({ success: false, message: e.message });
  }
};

module.exports = {
  sendMessage,
  llmChat,
  getSessions,
  createSession,
  getMessages,
  deleteSession,
};
