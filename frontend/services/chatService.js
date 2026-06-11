import { apiUrl, buildAuthHeaders, handleResponse, unwrapData } from "./apiClient";

export const chatService = {
  async sendMessage({ message, session_id, history }) {
    const res = await fetch(apiUrl("/llm/chat"), {
      method: "POST",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({
        message,
        ...(session_id ? { session_id } : {}),
        ...(history ? { history } : {}),
      }),
    });
    const result = await handleResponse(res);
    return unwrapData(result);
  },

  async getSessions() {
    const res = await fetch(apiUrl("/chat/sessions"), {
      headers: buildAuthHeaders(),
    });
    const result = await handleResponse(res);
    const data = unwrapData(result);
    return Array.isArray(data) ? data : [];
  },

  async getSessionMessages(sessionId) {
    const res = await fetch(apiUrl(`/chat/sessions/${sessionId}/messages`), {
      headers: buildAuthHeaders(),
    });
    const result = await handleResponse(res);
    const data = unwrapData(result);
    return Array.isArray(data) ? data : [];
  },

  async deleteSession(sessionId) {
    const res = await fetch(apiUrl(`/chat/sessions/${sessionId}`), {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });
    const result = await handleResponse(res);
    return unwrapData(result);
  },
};

