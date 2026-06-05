const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const authService = {
  async register({ full_name, email, phone, password, role = "buyer" }) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name, email, phone, password, role }),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Register gagal");
    }
    return data;
  },

  async login({ email, password }) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Login gagal");
    }

    // Save session with correct field mapping
    const d = data.data;
    this.saveSession(d);

    return data;
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
