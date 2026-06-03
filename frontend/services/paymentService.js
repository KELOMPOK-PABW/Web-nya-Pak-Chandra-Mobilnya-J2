import { authService } from "./authService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

function authHeaders() {
  const token = authService.getToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

export const paymentService = {
  // GET /payments/{order_id}
  async getPaymentByOrderId(orderId) {
    const res = await fetch(`${BASE_URL}/payments/${orderId}`, {
      headers: authHeaders(),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  // POST /payments → { data: { payment_id, status } }
  async createPayment(orderId) {
    const res = await fetch(`${BASE_URL}/payments`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ order_id: orderId }),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  // POST /payments/{id}/pay → { data: { status, balance_after } }
  async pay(paymentId) {
    const res = await fetch(`${BASE_URL}/payments/${paymentId}/pay`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ payment_id: paymentId }),
    });
    const data = await handleResponse(res);
    return data.data;
  },
};
