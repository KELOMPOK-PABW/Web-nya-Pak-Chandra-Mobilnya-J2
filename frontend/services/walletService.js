import { buildAuthHeaders, apiFetch } from "./apiClient";

export const walletService = {
  // GET /wallet → { data: { balance } }
  async getBalance() {
    try {
      const data = await apiFetch("/wallet", { headers: buildAuthHeaders() });
      return data.data.balance;
    } catch (err) {
      console.log("walletService.getBalance failed:", err.message || err);
      return null;
    }
  },

  // GET /wallet/transactions → { data: [...] }
  async getTransactions() {
    try {
      const data = await apiFetch("/wallet/transactions", { headers: buildAuthHeaders() });
      return data.data;
    } catch (err) {
      return [];
    }
  },

  // POST /wallet/topup -> { data: { balance_after } }
  async topup(amount) {
    const data = await apiFetch("/wallet/topup", {
      method: "POST",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ amount }),
    });
    return data.data;
  },

  // POST /wallet/refund -> { data: { balance_after } }
  async refund(orderId) {
    const data = await apiFetch("/wallet/refund", {
      method: "POST",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ order_id: orderId }),
    });
    return data.data;
  },
};
