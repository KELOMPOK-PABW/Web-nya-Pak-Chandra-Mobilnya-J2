import { apiUrl, buildAuthHeaders, handleResponse } from "./apiClient";

export const productService = {
  async getProducts(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
    });
    const qs = searchParams.toString();
    const url = apiUrl(`/products${qs ? `?${qs}` : ''}`);
    const res = await fetch(url);
    const data = await handleResponse(res);
    return { data: data.data, meta: data.meta };
  },

  async getProductById(id) {
    const res = await fetch(apiUrl(`/products/${id}`));
    const data = await handleResponse(res);
    return data.data;
  },

  async getCategories() {
    const res = await fetch(apiUrl("/categories"));
    const data = await handleResponse(res);
    return data.data;
  },

  async getSellerProducts() {
    const res = await fetch(apiUrl("/seller/products"), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return { data: data.data, meta: data.meta };
  },

  async createProduct(payload) {
    const res = await fetch(apiUrl("/seller/products"), {
      method: "POST",
      headers: buildAuthHeaders(true),
      body: JSON.stringify(payload),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  async updateProduct(id, payload) {
    const res = await fetch(apiUrl(`/seller/products/${id}`), {
      method: "PUT",
      headers: buildAuthHeaders(true),
      body: JSON.stringify(payload),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  async deleteProduct(id) {
    const res = await fetch(apiUrl(`/seller/products/${id}`), {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return data;
  },
};
