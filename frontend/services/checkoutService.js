import { apiUrl, buildAuthHeaders, handleResponse } from "./apiClient";

function unwrapData(payload) {
  return payload?.data ?? payload;
}

export const checkoutService = {
  async createOrder({ cart_id, address_id, payment_method = "ewallet" }) {
    const res = await fetch(apiUrl("/checkout"), {
      method: "POST",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ cart_id, address_id, payment_method }),
    });
    const data = await handleResponse(res);
    return unwrapData(data);
  },

  async getAddresses() {
    const res = await fetch(apiUrl("/addresses"), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    const list = unwrapData(data);
    return Array.isArray(list) ? list : [];
  },
};

