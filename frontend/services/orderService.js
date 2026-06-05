import { apiUrl, buildAuthHeaders, handleResponse } from "./apiClient";

function unwrapData(payload) {
  return payload?.data ?? payload;
}

function normalizeOrder(order = {}) {
  const items = order.items ?? order.order_items ?? [];
  const totalFromItems = Array.isArray(items)
    ? items.reduce((sum, item) => {
        if (item.subtotal !== undefined && item.subtotal !== null) return sum + Number(item.subtotal);
        return sum + Number(item.price ?? item.product?.price ?? 0) * Number(item.qty ?? item.quantity ?? 1);
      }, 0)
    : 0;

  return {
    ...order,
    id: order.id ?? order.order_id,
    orderId: order.orderId ?? order.order_id ?? order.id,
    status: order.status ?? order.payment_status ?? "pending",
    total: order.total ?? order.total_price ?? order.totalAmount ?? totalFromItems,
    createdAt: order.createdAt ?? order.created_at ?? order.order_date ?? null,
    items: Array.isArray(items) ? items : [],
  };
}

export const orderService = {
  async getOrders() {
    const res = await fetch(apiUrl("/orders"), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    const list = unwrapData(data);
    return Array.isArray(list) ? list.map(normalizeOrder) : [];
  },

  async getOrderById(id) {
    const res = await fetch(apiUrl(`/orders/${id}`), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return normalizeOrder(unwrapData(data));
  },

  async getOrderItems(id) {
    const res = await fetch(apiUrl(`/orders/${id}/items`), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    const list = unwrapData(data);
    return Array.isArray(list) ? list : [];
  },

  async cancelOrder(id) {
    const res = await fetch(apiUrl(`/orders/${id}/cancel`), {
      method: "PUT",
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return unwrapData(data);
  },

  async confirmOrder(id) {
    const res = await fetch(apiUrl(`/orders/${id}/confirm`), {
      method: "PUT",
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return unwrapData(data);
  },
};
