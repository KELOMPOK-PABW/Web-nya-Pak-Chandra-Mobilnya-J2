const logger = require("../../utils/logger");
const {
  buildOllamaSystemInstruction,
  buildOllamaMessages,
  validateAndNormalizeResponse,
  extractJson,
} = require("./shared");

const DEFAULT_BASE_URL = "http://localhost:11434";
const DEFAULT_MODEL = "qwen2.5:7b";

const classifyAndSuggest = async ({ message, history = [], productsContext = [] }) => {
  const baseUrl = process.env.OLLAMA_BASE_URL || DEFAULT_BASE_URL;
  const model = process.env.OLLAMA_MODEL || DEFAULT_MODEL;

  const systemInstruction = buildOllamaSystemInstruction(productsContext);
  const messages = buildOllamaMessages(systemInstruction, history, message);

  let response;
  try {
    response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: false }),
    });
  } catch (error) {
    logger.error(
      { err: error, provider: "ollama", baseUrl, model },
      "Ollama fetch failed"
    );
    throw new Error(
      `Layanan AI lokal tidak dapat dijangkau di ${baseUrl}. Pastikan Ollama sedang berjalan.`
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    logger.error(
      { provider: "ollama", baseUrl, model, status: response.status, body: body.slice(0, 500) },
      "Ollama returned non-ok response"
    );
    throw new Error(
      `Layanan AI lokal mengembalikan error HTTP ${response.status}${body ? `: ${body.slice(0, 200)}` : ""}`
    );
  }

  const data = await response.json().catch(() => null);
  const rawText = data?.message?.content;
  if (!rawText) {
    throw new Error("Layanan AI lokal tidak mengembalikan jawaban");
  }

  const parsed = extractJson(rawText);
  return validateAndNormalizeResponse(parsed, productsContext);
};

module.exports = { classifyAndSuggest };
