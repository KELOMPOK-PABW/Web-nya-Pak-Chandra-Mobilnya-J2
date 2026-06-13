import { buildAuthHeaders, apiFetch, unwrapData } from "./apiClient";

export const checkoutService = {
  async createOrder({ cart_id, address_id, payment_method = "ewallet" }) {
    const data = await apiFetch("/checkout", { method: "POST", headers: buildAuthHeaders(true), body: JSON.stringify({ cart_id, address_id, payment_method }) });
    return unwrapData(data);
  },

  async getAddresses() {
    const data = await apiFetch("/addresses", { headers: buildAuthHeaders() });
    const list = unwrapData(data);
    return Array.isArray(list) ? list : [];
  },
};

