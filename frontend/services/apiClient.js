import { authService } from "./authService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));

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
  return `${BASE_URL}${path}`;
}

export function unwrapData(payload) {
  return payload?.data ?? payload;
}

