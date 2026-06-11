import { apiUrl, buildAuthHeaders, handleResponse, unwrapData } from "./apiClient";

export const addressService = {
  async list() {
    const res = await fetch(apiUrl("/addresses"), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    const list = unwrapData(data);
    return Array.isArray(list) ? list : [];
  },

  async create({ address, city, postal_code }) {
    const res = await fetch(apiUrl("/addresses"), {
      method: "POST",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ address, city, postal_code }),
    });
    const data = await handleResponse(res);
    return unwrapData(data);
  },

  async update(id, { address, city, postal_code }) {
    const res = await fetch(apiUrl(`/addresses/${id}`), {
      method: "PUT",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ address, city, postal_code }),
    });
    const data = await handleResponse(res);
    return unwrapData(data);
  },

  async remove(id) {
    const res = await fetch(apiUrl(`/addresses/${id}`), {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return unwrapData(data);
  },
};
