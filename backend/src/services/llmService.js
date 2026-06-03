const { getProvider } = require("./llm/providerFactory");
const { INTENTS } = require("./llm/shared");

/**
 * Classify user message and extract intent + entities using the active LLM provider.
 * Delegates to the provider selected via LLM_PROVIDER env variable.
 *
 * @param {object} params
 * @param {string} params.message          - User message text
 * @param {Array}  [params.history]        - Previous conversation turns [{role, content}]
 * @param {Array}  [params.productsContext] - Catalog snapshot [{id, name, price, stock, ...}]
 * @returns {Promise<{intent, reply, suggested_product_ids, entities}>}
 */
const classifyAndSuggest = async (params) => {
  const provider = getProvider();
  return provider.classifyAndSuggest(params);
};

module.exports = {
  classifyAndSuggest,
  INTENTS,
};
