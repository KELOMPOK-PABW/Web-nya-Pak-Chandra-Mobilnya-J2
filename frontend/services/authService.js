import { apiUrl } from "./apiClient";

export const authService = {
  async register({ full_name, email, phone, password }) {
    try {
      const res = await fetch(apiUrl(`/auth/register`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email, phone, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Register gagal");
      }
      return data;
    } catch (err) {
      const msg = String(err?.message || err);
      if (/failed to fetch|networkerror|network request failed|net::err_|ecconnectrefused|ecconnrefused/i.test(msg)) {
        throw new Error("Gagal terhubung ke server. Periksa koneksi dan coba lagi.");
      }
      throw new Error(msg || "Terjadi kesalahan jaringan.");
    }
  },

  async login({ email, password }) {
    try {
      const res = await fetch(apiUrl(`/auth/login`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Login gagal");
      }

      // Save session with correct field mapping
      const d = data.data;
      this.saveSession(d);

      return data;
    } catch (err) {
      const msg = String(err?.message || err);
      if (/failed to fetch|networkerror|network request failed|net::err_|ecconnectrefused|ecconnrefused/i.test(msg)) {
        throw new Error("Gagal terhubung ke server. Periksa koneksi dan coba lagi.");
      }
      throw new Error(msg || "Terjadi kesalahan jaringan.");
    }
  },

  saveSession(data) {
    if (typeof window === "undefined") return;

    // Backend returns: { access_token, user: { id, full_name, email, roles, is_active } }
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
    }
    if (data.user) {
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user.id,
          full_name: data.user.full_name,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.roles?.[0] || "buyer",
        })
      );
    }
  },

  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  },

  getUser() {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  logout() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
