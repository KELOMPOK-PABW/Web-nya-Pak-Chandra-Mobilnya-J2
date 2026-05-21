const Joi = require("joi");

const sendMessageSchema = Joi.object({
  session_id: Joi.number().integer().positive().optional().messages({
    "number.base": "session_id harus angka",
    "number.integer": "session_id harus bilangan bulat",
    "number.positive": "session_id harus positif",
  }),
  message: Joi.string().min(1).max(2000).required().messages({
    "any.required": "Pesan wajib diisi",
    "string.empty": "Pesan tidak boleh kosong",
    "string.max": "Pesan maksimal 2000 karakter",
  }),
});

const historyItemSchema = Joi.object({
  role: Joi.string().valid("user", "assistant").required(),
  content: Joi.string().min(1).max(4000).required(),
});

const llmChatSchema = Joi.object({
  message: Joi.string().min(1).max(2000).required().messages({
    "any.required": "Pesan wajib diisi",
    "string.empty": "Pesan tidak boleh kosong",
    "string.max": "Pesan maksimal 2000 karakter",
  }),
  session_id: Joi.number().integer().positive().optional(),
  history: Joi.array().items(historyItemSchema).max(20).optional(),
});

module.exports = {
  sendMessageSchema,
  llmChatSchema,
};
