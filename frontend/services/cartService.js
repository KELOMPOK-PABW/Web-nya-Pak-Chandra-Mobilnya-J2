import { buildAuthHeaders, apiFetch } from "./apiClient";

export const cartService = {
  async getCart() {
    const data = await apiFetch("/cart", { headers: buildAuthHeaders() });
    return data.data || [];
  },

  async addItem({ product_id, qty }) {
    const data = await apiFetch("/cart/items", { method: "POST", headers: buildAuthHeaders(true), body: JSON.stringify({ product_id, qty }) });
    return data.data;
  },

  async updateItem(id, qty) {
    const data = await apiFetch(`/cart/items/${id}`, { method: "PUT", headers: buildAuthHeaders(true), body: JSON.stringify({ qty }) });
    return data.data;
  },

  async deleteItem(id) {
    const data = await apiFetch(`/cart/items/${id}`, { method: "DELETE", headers: buildAuthHeaders() });
    return data.data;
  },

  async validateCart() {
    const data = await apiFetch("/cart/validate", { headers: buildAuthHeaders() });
    return data.data;
  },

  async countCartItems() {
    const data = await apiFetch("/cart/count", { headers: buildAuthHeaders() });
    return data.data;
  },

  async clearCart() {
    const data = await apiFetch("/cart", { method: "DELETE", headers: buildAuthHeaders() });
    return data.data;
  },
};