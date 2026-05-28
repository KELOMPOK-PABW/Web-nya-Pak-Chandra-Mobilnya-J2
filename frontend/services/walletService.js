import { authService } from "./authService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
// Use relative /api path in frontend to avoid CORS (rewrites or same-origin)
const API_PREFIX = "/api";

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

export const walletService = {
  // GET /wallet → { data: { balance } }
  async getBalance() {
    const res = await fetch(`${API_PREFIX}/wallet`, {
      headers: authHeaders(),
    });
    const data = await handleResponse(res);
    return data.data.balance;
  },

  // GET /wallet/transactions → { data: [...] }
  async getTransactions() {
    try {
      const res = await fetch(`${API_PREFIX}/wallet/transactions`, {
        headers: authHeaders(),
      });
      const data = await handleResponse(res);
      return data.data;
    } catch (err) {
      // Jika gagal ambil transaksi, fallback ke array kosong
      return [];
    }
  },
};