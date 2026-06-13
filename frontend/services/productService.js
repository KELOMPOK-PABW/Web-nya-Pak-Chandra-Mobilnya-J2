import { buildAuthHeaders, apiFetch } from "./apiClient";

export const productService = {
  async getProducts(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
    });
    const qs = searchParams.toString();
    const path = `/products${qs ? `?${qs}` : ''}`;
    const data = await apiFetch(path);
    return { data: data.data, meta: data.meta };
  },

  async getProductById(id) {
    const data = await apiFetch(`/products/${id}`);
    return data.data;
  },

  async getCategories() {
    const data = await apiFetch("/categories");
    return data.data;
  },

  async getSellerProducts() {
    const data = await apiFetch("/seller/products", { headers: buildAuthHeaders() });
    return { data: data.data, meta: data.meta };
  },

  async createProduct(payload) {
    const data = await apiFetch("/seller/products", { method: "POST", headers: buildAuthHeaders(true), body: JSON.stringify(payload) });
    return data.data;
  },

  async updateProduct(id, payload) {
    const data = await apiFetch(`/seller/products/${id}`, { method: "PUT", headers: buildAuthHeaders(true), body: JSON.stringify(payload) });
    return data.data;
  },

  async deleteProduct(id) {
    const data = await apiFetch(`/seller/products/${id}`, { method: "DELETE", headers: buildAuthHeaders() });
    return data;
  },
};
