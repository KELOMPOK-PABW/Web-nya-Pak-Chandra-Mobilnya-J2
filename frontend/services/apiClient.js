import { authService } from "./authService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  // Map authentication-related server messages to a generic client message
  const serverMsg = (data && data.message) ? String(data.message) : "";
  if (res.status === 401 || /token tidak valid|kedaluwarsa|akses ditolak/i.test(serverMsg)) {
    // Clear local session and redirect to login immediately to avoid showing server auth message
    try {
      authService.logout();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    } catch (e) {
      // ignore
    }
    // Throw to short-circuit any further UI handling (redirect will occur)
    throw new Error("SESSION_EXPIRED");
  }

  if (!res.ok || data.success === false) {
    // Server-side errors: localize common statuses
    if (res.status >= 500) {
      throw new Error("Terjadi kesalahan pada server. Silakan coba lagi nanti.");
    }
    if (res.status === 429) {
      throw new Error("Terlalu banyak permintaan. Coba lagi sebentar.");
    }

    // Expose validation or business messages coming from server (kept in Indonesian where possible)
    if (serverMsg) {
      throw new Error(serverMsg);
    }

    throw new Error(`Request failed with status ${res.status}`);
  }

  return data;
}

// Wrapper around fetch + handleResponse that normalizes network errors
export async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(apiUrl(path), options);
    return await handleResponse(res);
  } catch (err) {
    const msg = String(err?.message || err);
    // Common network-level failures (browser/DevServer/ECONN issues)
    if (/failed to fetch|networkerror|network request failed|net::err_|ecconnectrefused|ecconnrefused/i.test(msg)) {
      throw new Error("Gagal terhubung ke server. Periksa koneksi dan coba lagi.");
    }
    // Pass through other human-friendly messages
    throw new Error(msg || "Terjadi kesalahan jaringan.");
  }
}

export function buildAuthHeaders(isJson = false) {
  const token = authService.getToken();
  const headers = {};

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export function apiUrl(path) {
  if (!BASE_URL) return path;
  const base = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export function unwrapData(payload) {
  return payload?.data ?? payload;
}

