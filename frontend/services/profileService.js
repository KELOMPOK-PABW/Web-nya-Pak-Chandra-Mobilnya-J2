import { buildAuthHeaders, apiFetch, unwrapData } from "./apiClient";

export const profileService = {
  async getMe() {
    const data = await apiFetch("/me", { headers: buildAuthHeaders() });
    return unwrapData(data);
  },

  async updateMe({ full_name, phone }) {
    const data = await apiFetch("/me", { method: "PUT", headers: buildAuthHeaders(true), body: JSON.stringify({ full_name, phone }) });
    return unwrapData(data);
  },
};
