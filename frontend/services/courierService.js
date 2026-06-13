import { apiUrl, buildAuthHeaders, handleResponse, unwrapData } from "./apiClient";

function normalizeTask(task = {}) {
  return {
    ...task,
    assignment_id: task.assignment_id ?? task.id,
    courier_id: task.courier_id ?? task.kurir_id,
    order_item_id: task.order_item_id,
    product_name: task.product_name ?? task.product?.name ?? "Produk",
    pickup_address: task.pickup_address ?? task.store?.address ?? "-",
    delivery_address: task.delivery_address ?? task.address?.address ?? "-",
    status: task.status ?? "menunggu kurir",
    assigned_at: task.assigned_at ?? task.created_at ?? null,
    created_at: task.created_at ?? task.assigned_at ?? null,
    buyer_name: task.buyer_name ?? task.buyer?.full_name ?? "-",
    buyer_phone: task.buyer_phone ?? task.buyer?.phone ?? "-",
    store_name: task.store_name ?? task.store?.store_name ?? "-",
    store_phone: task.store_phone ?? task.store?.phone ?? "-",
  };
}

function normalizeList(payload) {
  const data = unwrapData(payload);
  return Array.isArray(data) ? data.map(normalizeTask) : [];
}

export const courierService = {
  async assignCourier({ order_item_id, kurir_id }) {
    const res = await fetch(apiUrl("/courier/assign"), {
      method: "POST",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ order_item_id, kurir_id }),
    });
    const data = await handleResponse(res);
    return normalizeTask(unwrapData(data));
  },

  async getAssignment(id) {
    const res = await fetch(apiUrl(`/courier/assignments/${id}`), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return normalizeTask(unwrapData(data));
  },

  async getAssignmentByOrderItem(orderItemId) {
    const res = await fetch(apiUrl(`/courier/order-items/${orderItemId}`), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    // backend might return an assignment object or an array; normalizeTask will handle single object
    return normalizeTask(unwrapData(data));
  },

  async getTasks() {
    const res = await fetch(apiUrl("/courier/task"), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return normalizeList(data);
  },

  async pickupOrderItem(orderItemId) {
    const res = await fetch(apiUrl(`/courier/order-items/${orderItemId}/pickup`), {
      method: "PUT",
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return unwrapData(data);
  },

  async deliverOrderItem(orderItemId) {
    const res = await fetch(apiUrl(`/courier/order-items/${orderItemId}/deliver`), {
      method: "PUT",
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return unwrapData(data);
  },

  async returnOrderItem(orderItemId) {
    const res = await fetch(apiUrl(`/courier/order-items/${orderItemId}/return`), {
      method: "PUT",
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return unwrapData(data);
  },

  async returnToSeller(orderItemId) {
    const res = await fetch(apiUrl(`/courier/order-items/${orderItemId}/return-to-seller`), {
      method: "PUT",
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return unwrapData(data);
  },
};

