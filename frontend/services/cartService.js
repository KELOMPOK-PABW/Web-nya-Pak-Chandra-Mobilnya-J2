import { authService } from "./authService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

function buildAuthHeaders(isJson = false) {
  const token = authService.getToken();
  const headers = {};

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export const cartService = {
  async getCart() {
    const res = await fetch(`${BASE_URL}/cart`, {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return data.data || [];
  },

  async addItem({ product_id, qty }) {
    const res = await fetch(`${BASE_URL}/cart/items`, {
      method: "POST",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ product_id, qty }),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  async updateItem(id, qty) {
    const res = await fetch(`${BASE_URL}/cart/items/${id}`, {
      method: "PUT",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ qty }),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  async deleteItem(id) {
    const res = await fetch(`${BASE_URL}/cart/items/${id}`, {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  async validateCart() {
    const res = await fetch(`${BASE_URL}/cart/validate`, {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  async countCartItems() {
    const res = await fetch(`${BASE_URL}/cart/count`, {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  async clearCart() {
    const res = await fetch(`${BASE_URL}/cart`, {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return data.data;
  },
};