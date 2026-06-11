import { apiUrl, buildAuthHeaders, handleResponse } from "./apiClient";

export const cartService = {
  async getCart() {
    const res = await fetch(apiUrl("/cart"), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return data.data || [];
  },

  async addItem({ product_id, qty }) {
    const res = await fetch(apiUrl("/cart/items"), {
      method: "POST",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ product_id, qty }),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  async updateItem(id, qty) {
    const res = await fetch(apiUrl(`/cart/items/${id}`), {
      method: "PUT",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ qty }),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  async deleteItem(id) {
    const res = await fetch(apiUrl(`/cart/items/${id}`), {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  async validateCart() {
    const res = await fetch(apiUrl("/cart/validate"), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  async countCartItems() {
    const res = await fetch(apiUrl("/cart/count"), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  async clearCart() {
    const res = await fetch(apiUrl("/cart"), {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return data.data;
  },
};