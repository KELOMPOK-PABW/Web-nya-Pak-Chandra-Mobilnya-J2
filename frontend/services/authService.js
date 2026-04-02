const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const authService = {
  async register({ full_name, email, password, role = "buyer" }) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Register gagal");
    return data;
  },

  async login({ email, password }) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login gagal");
    return data;
  },

  saveSession(data) {
    if (typeof window === "undefined") return;
    if (data.token) localStorage.setItem("token", data.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.user_id,
        full_name: data.full_name,
        role: data.role,
      })
    );
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