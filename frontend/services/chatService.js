import { buildAuthHeaders, apiFetch, unwrapData } from "./apiClient";

function normalizeSession(session = {}) {
  return {
    ...session,
    id: session.id ?? session.session_id,
    title: session.title ?? session.name ?? "Chat baru",
    message_count: session.message_count ?? session.messages_count ?? 0,
    last_message: session.last_message ?? session.latest_message ?? "",
    updated_at: session.updated_at ?? session.updatedAt ?? session.created_at,
  };
}

function normalizeMessage(message = {}) {
  return {
    ...message,
    id: message.id ?? message.message_id,
    role: message.role ?? message.sender ?? "assistant",
    content: message.content ?? message.message ?? "",
    createdAt: message.createdAt ?? message.created_at,
    suggested_products: message.suggested_products ?? message.products ?? [],
    follow_up_suggestions: message.follow_up_suggestions ?? message.followUpSuggestions ?? [],
    review_summary: message.review_summary ?? message.reviewData ?? message.review_data ?? null,
    entities: message.entities ?? {},
    citations: message.citations ?? [],
  };
}

export const chatService = {
  async sendMessage({ message, session_id, history }) {
    const result = await apiFetch("/llm/chat", { method: "POST", headers: buildAuthHeaders(true), body: JSON.stringify({ message, ...(session_id ? { session_id } : {}), ...(history ? { history } : {}) }) });
    return unwrapData(result);
  },

  async getSessions() {
    const result = await apiFetch("/chat/sessions", { headers: buildAuthHeaders() });
    const data = unwrapData(result);
    return Array.isArray(data) ? data.map(normalizeSession) : [];
  },

  async getSessionMessages(sessionId) {
    const result = await apiFetch(`/chat/sessions/${sessionId}/messages`, { headers: buildAuthHeaders() });
    const data = unwrapData(result);
    return Array.isArray(data) ? data.map(normalizeMessage) : [];
  },

  async deleteSession(sessionId) {
    const result = await apiFetch(`/chat/sessions/${sessionId}`, { method: "DELETE", headers: buildAuthHeaders() });
    return unwrapData(result);
  },
};

