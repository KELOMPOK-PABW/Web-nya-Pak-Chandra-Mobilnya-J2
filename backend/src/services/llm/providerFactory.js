const geminiProvider = require("./geminiProvider");
const ollamaProvider = require("./ollamaProvider");

const PROVIDERS = {
  gemini: geminiProvider,
  ollama: ollamaProvider,
};

/**
 * Return the active LLM provider based on LLM_PROVIDER env variable.
 * Defaults to "gemini" for backward compatibility.
 */
const getProvider = () => {
  const name = (process.env.LLM_PROVIDER || "gemini").toLowerCase();
  const provider = PROVIDERS[name];
  if (!provider) {
    throw new Error(
      `LLM_PROVIDER "${name}" tidak dikenal. Pilihan: ${Object.keys(PROVIDERS).join(", ")}`
    );
  }
  return provider;
};

module.exports = { getProvider, PROVIDERS };
