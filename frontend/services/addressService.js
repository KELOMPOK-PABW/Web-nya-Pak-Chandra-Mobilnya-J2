import { buildAuthHeaders, apiFetch, unwrapData } from "./apiClient";

export const addressService = {
  async list() {
    const data = await apiFetch("/addresses", { headers: buildAuthHeaders() });
    const list = unwrapData(data);
    return Array.isArray(list) ? list : [];
  },

  async create({ address, city, postal_code }) {
    const data = await apiFetch("/addresses", {
      method: "POST",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ address, city, postal_code }),
    });
    return unwrapData(data);
  },

  async update(id, { address, city, postal_code }) {
    const data = await apiFetch(`/addresses/${id}`, {
      method: "PUT",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ address, city, postal_code }),
    });
    return unwrapData(data);
  },

  async remove(id) {
    const data = await apiFetch(`/addresses/${id}`, {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });
    return unwrapData(data);
  },
};
