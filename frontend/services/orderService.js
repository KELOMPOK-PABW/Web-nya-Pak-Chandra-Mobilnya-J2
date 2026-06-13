import { buildAuthHeaders, apiFetch, unwrapData } from "./apiClient";

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
    status: order.status ?? order.order_status ?? order.payment_status ?? order.paymentStatus ?? "pending",
    total: order.total ?? order.total_price ?? order.totalAmount ?? totalFromItems,
    createdAt: order.createdAt ?? order.created_at ?? order.order_date ?? null,
    itemCount: order.itemCount ?? order.item_count ?? items.length,
    items,
  };
}

export const orderService = {
  /** GET /api/orders — list semua order milik buyer */
  async getOrders() {
    const data = await apiFetch("/orders", { headers: buildAuthHeaders() });
    const list = unwrapData(data);
    return Array.isArray(list) ? list.map(normalizeOrder) : [];
  },

  /** GET /api/orders/:id — detail order */
  async getOrderById(id) {
    const data = await apiFetch(`/orders/${id}`, { headers: buildAuthHeaders() });
    return normalizeOrder(unwrapData(data));
  },

  /** GET /api/orders/:id/items — item-item dalam order */
  async getOrderItems(id) {
    const data = await apiFetch(`/orders/${id}/items`, { headers: buildAuthHeaders() });
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
      const data = await apiFetch(`/orders/${id}/history`, { headers: buildAuthHeaders() });
      const list = unwrapData(data);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  /** PUT /api/orders/:id/cancel — batalkan order (BE menyusul) */
  async cancelOrder(id) {
    const data = await apiFetch(`/orders/${id}/cancel`, { method: "PUT", headers: buildAuthHeaders() });
    return unwrapData(data);
  },

  /** PUT /api/orders/:id/confirm — konfirmasi terima order (BE menyusul) */
  async confirmOrder(id) {
    const data = await apiFetch(`/orders/${id}/confirm`, { method: "PUT", headers: buildAuthHeaders() });
    return unwrapData(data);
  },
};
