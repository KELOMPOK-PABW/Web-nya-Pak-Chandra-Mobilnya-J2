import { authService } from "./authService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  // Map authentication-related server messages to a generic client message
  const serverMsg = (data && data.message) ? String(data.message) : "";
  if (res.status === 401 || /token tidak valid|kedaluwarsa|akses ditolak/i.test(serverMsg)) {
    throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
  }

  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
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
  return `${base}/api${p}`;
}

export function unwrapData(payload) {
  return payload?.data ?? payload;
}

