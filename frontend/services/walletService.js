import { apiUrl, buildAuthHeaders, handleResponse } from "./apiClient";

export const walletService = {
  // GET /wallet → { data: { balance } }
  async getBalance() {
    const res = await fetch(apiUrl("/wallet"), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return data.data.balance;
  },

  // GET /wallet/transactions → { data: [...] }
  async getTransactions() {
    try {
      const res = await fetch(apiUrl("/wallet/transactions"), {
        headers: buildAuthHeaders(),
      });
      const data = await handleResponse(res);
      return data.data;
    } catch (err) {
      return [];
    }
  },
};
