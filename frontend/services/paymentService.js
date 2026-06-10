import { apiUrl, buildAuthHeaders, handleResponse } from "./apiClient";

export const paymentService = {
  // GET /payments/{order_id}
  async getPaymentByOrderId(orderId) {
    const res = await fetch(apiUrl(`/payments/${orderId}`), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  // POST /payments → { data: { payment_id, status } }
  async createPayment(orderId) {
    const res = await fetch(apiUrl("/payments"), {
      method: "POST",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ order_id: orderId }),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  // POST /payments/{id}/pay → { data: { status, balance_after } }
  async pay(paymentId) {
    const res = await fetch(apiUrl(`/payments/${paymentId}/pay`), {
      method: "POST",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ payment_id: paymentId }),
    });
    const data = await handleResponse(res);
    return data.data;
  },
};
