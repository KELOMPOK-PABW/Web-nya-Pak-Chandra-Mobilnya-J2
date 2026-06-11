import { apiUrl, buildAuthHeaders, handleResponse, unwrapData } from "./apiClient";

/**
 * Normalise raw order object from BE.
 * BE list shape  : { id, status (paymentStatus), total_price }
 * BE detail shape: { order_id, payment_status, address, items, created_at? }
 */
function normalizeOrder(order = {}) {
  const rawItems = order.items ?? order.order_items ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [];

  const totalFromItems = items.reduce((sum, item) => {
    if (item.subtotal !== undefined && item.subtotal !== null) return sum + Number(item.subtotal);
    return sum + Number(item.price ?? item.priceSnap ?? item.product?.price ?? 0) * Number(item.qty ?? item.quantity ?? 1);
  }, 0);

  return {
    ...order,
    id: order.id ?? order.order_id,
    orderId: order.orderId ?? order.order_id ?? order.id,
    // Prefer payment_status (detail) over status (list)
    status: order.payment_status ?? order.status ?? order.paymentStatus ?? "pending",
    total: order.total ?? order.total_price ?? order.totalAmount ?? totalFromItems,
    createdAt: order.createdAt ?? order.created_at ?? order.order_date ?? null,
    items,
  };
}

export const orderService = {
  /** GET /api/orders — list semua order milik buyer */
  async getOrders() {
    const res = await fetch(apiUrl("/orders"), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    const list = unwrapData(data);
    return Array.isArray(list) ? list.map(normalizeOrder) : [];
  },

  /** GET /api/orders/:id — detail order */
  async getOrderById(id) {
    const res = await fetch(apiUrl(`/orders/${id}`), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return normalizeOrder(unwrapData(data));
  },

  /** GET /api/orders/:id/items — item-item dalam order */
  async getOrderItems(id) {
    const res = await fetch(apiUrl(`/orders/${id}/items`), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    const list = unwrapData(data);
    return Array.isArray(list) ? list : [];
  },

  /**
   * GET /api/orders/:id/history — riwayat status order.
   * Endpoint ini akan ditambahkan BE nanti.
   * Untuk saat ini selalu return array kosong agar UI tidak crash.
   */
  async getOrderHistory(id) {
    try {
      const res = await fetch(apiUrl(`/orders/${id}/history`), {
        headers: buildAuthHeaders(),
      });
      if (!res.ok) return [];
      const data = await handleResponse(res);
      const list = unwrapData(data);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  /** PUT /api/orders/:id/cancel — batalkan order (BE menyusul) */
  async cancelOrder(id) {
    const res = await fetch(apiUrl(`/orders/${id}/cancel`), {
      method: "PUT",
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return unwrapData(data);
  },

  /** PUT /api/orders/:id/confirm — konfirmasi terima order (BE menyusul) */
  async confirmOrder(id) {
    const res = await fetch(apiUrl(`/orders/${id}/confirm`), {
      method: "PUT",
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return unwrapData(data);
  },
};
