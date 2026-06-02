import { authService } from "./authService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const chatService = {
  /**
   * Send a message to the LLM assistant and get an AI response.
   * @param {object} params
   * @param {string} params.message            - User message
   * @param {number} [params.session_id]       - Existing session ID (for multi-turn)
   * @param {Array}  [params.history]          - Previous conversation history
   * @returns {Promise<{intent, reply, suggested_products, entities}>}
   */
  async sendMessage({ message, session_id, history }) {
    const token = authService.getToken();
    const res = await fetch(`${BASE_URL}/llm/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        message,
        ...(session_id ? { session_id } : {}),
        ...(history ? { history } : {}),
      }),
    });
    const result = await handleResponse(res);
    return result.data; // { session_id, intent, reply, suggested_products, entities }
  },

  /**
   * Fetch all chat sessions for the logged-in user.
   * @returns {Promise<Array<{id, title, message_count, last_message, created_at, updated_at}>>}
   */
  async getSessions() {
    const token = authService.getToken();
    const res = await fetch(`${BASE_URL}/chat/sessions`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    const result = await handleResponse(res);
    return result.data;
  },

  /**
   * Fetch all messages for a specific chat session.
   * @param {number} sessionId
   * @returns {Promise<Array<{id, role, content, intent, entities, suggested_product_ids, created_at}>>}
   */
  async getSessionMessages(sessionId) {
    const token = authService.getToken();
    const res = await fetch(`${BASE_URL}/chat/sessions/${sessionId}/messages`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    const result = await handleResponse(res);
    return result.data;
  },

  /**
   * Delete a chat session and all its messages.
   * @param {number} sessionId
   * @returns {Promise<{deleted: boolean}>}
   */
  async deleteSession(sessionId) {
    const token = authService.getToken();
    const res = await fetch(`${BASE_URL}/chat/sessions/${sessionId}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    const result = await handleResponse(res);
    return result.data;
  },
};
