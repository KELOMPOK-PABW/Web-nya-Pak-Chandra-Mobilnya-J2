import { buildAuthHeaders, apiFetch } from "./apiClient";

export const paymentService = {
  // GET /payments/{order_id}
  async getPaymentByOrderId(orderId) {
    const data = await apiFetch(`/payments/${orderId}`, { headers: buildAuthHeaders() });
    return data.data;
  },

  // POST /payments → { data: { payment_id, status } }
  async createPayment(orderId) {
    const data = await apiFetch("/payments", {
      method: "POST",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ order_id: orderId }),
    });
    return data.data;
  },

  // POST /payments/{id}/pay → { data: { status, balance_after } }
  async pay(paymentId) {
    const data = await apiFetch(`/payments/${paymentId}/pay`, {
      method: "POST",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ payment_id: paymentId }),
    });
    return data.data;
  },
};
