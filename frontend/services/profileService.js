import { apiUrl, buildAuthHeaders, handleResponse, unwrapData } from "./apiClient";

export const profileService = {
  async getMe() {
    const res = await fetch(apiUrl("/me"), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return unwrapData(data);
  },

  async updateMe({ full_name, phone }) {
    const res = await fetch(apiUrl("/me"), {
      method: "PUT",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ full_name, phone }),
    });
    const data = await handleResponse(res);
    return unwrapData(data);
  },
};
