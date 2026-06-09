import { authService } from "./authService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const productService = {
  async getProducts(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
    });
    const qs = searchParams.toString();
    const url = `${BASE_URL}/products${qs ? `?${qs}` : ''}`;
    const res = await fetch(url);
    const data = await handleResponse(res);
    return { data: data.data, meta: data.meta };
  },

  async getProductById(id) {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    const data = await handleResponse(res);
    return data.data;
  },

  async getCategories() {
    const res = await fetch(`${BASE_URL}/categories`);
    const data = await handleResponse(res);
    return data.data;
  },

  async getSellerProducts() {
    const token = authService.getToken();
    const res = await fetch(`${BASE_URL}/seller/products`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    const data = await handleResponse(res);
    return { data: data.data, meta: data.meta };
  },

  async createProduct(payload) {
    const token = authService.getToken();
    const res = await fetch(`${BASE_URL}/seller/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  async updateProduct(id, payload) {
    const token = authService.getToken();
    const res = await fetch(`${BASE_URL}/seller/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  async deleteProduct(id) {
    const token = authService.getToken();
    const res = await fetch(`${BASE_URL}/seller/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    const data = await handleResponse(res);
    return data;
  },
};
