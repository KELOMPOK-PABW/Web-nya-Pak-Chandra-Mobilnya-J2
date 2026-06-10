import { apiUrl, buildAuthHeaders, handleResponse, unwrapData } from "./apiClient";

function normalizeStore(store = {}) {
  return {
    ...store,
    id: store.id ?? store.store_id,
    storeName: store.storeName ?? store.store_name ?? "",
    store_name: store.store_name ?? store.storeName ?? "",
    phone: store.phone ?? "",
    city: store.city ?? "",
    address: store.address ?? "",
    slogan: store.slogan ?? "",
    description: store.description ?? "",
    status: store.status ?? "active",
  };
}

function normalizeApplication(application = {}) {
  return {
    ...application,
    id: application.id ?? application.application_id ?? application.seller_application_id,
    ownerName:
      application.ownerName ??
      application.owner_name ??
      application.full_name ??
      application.user?.full_name ??
      application.user?.name ??
      "-",
    storeName: application.storeName ?? application.store_name ?? "-",
    category: application.category ?? application.storeCategory ?? application.store_category ?? "-",
    city: application.city ?? "-",
    phone: application.phone ?? "-",
    submittedAt: application.submittedAt ?? application.submitted_at ?? application.created_at ?? null,
    reviewedAt: application.reviewedAt ?? application.reviewed_at ?? application.updated_at ?? null,
    reviewerNote: application.reviewerNote ?? application.reviewer_note ?? application.reason ?? "",
    note: application.note ?? application.reason ?? application.description ?? "-",
    bankName: application.bankName ?? application.bank_name ?? "-",
    bankAccountNumber:
      application.bankAccountNumber ?? application.bank_account_number ?? application.account_number ?? "-",
    status: application.status ?? "pending",
  };
}

function normalizeOrder(order = {}) {
  const items = order.items ?? order.order_items ?? (order.product ? [order] : []);
  const firstItem = Array.isArray(items) ? items[0] : null;

  return {
    ...order,
    id: order.id ?? order.order_id ?? firstItem?.order_id ?? firstItem?.id,
    orderItemId:
      order.orderItemId ??
      order.order_item_id ??
      order.orderItem?.id ??
      firstItem?.order_item_id ??
      firstItem?.id,
    buyerName:
      order.buyerName ??
      order.buyer_name ??
      order.user?.full_name ??
      order.customer?.full_name ??
      order.buyer?.full_name ??
      "-",
    productName:
      order.productName ??
      order.product_name ??
      order.product?.name ??
      firstItem?.product?.name ??
      firstItem?.product_name ??
      "-",
    qty: order.qty ?? order.quantity ?? firstItem?.qty ?? firstItem?.quantity ?? 1,
    total:
      order.total ??
      order.total_price ??
      order.subtotal ??
      firstItem?.subtotal ??
      firstItem?.price ??
      0,
    status: order.status ?? firstItem?.status ?? "pending",
    createdAt: order.createdAt ?? order.created_at ?? order.order_date ?? null,
  };
}

function normalizeList(payload, mapper) {
  const data = unwrapData(payload);
  const list = Array.isArray(data) ? data : data?.items ?? data?.rows ?? [];
  return list.map(mapper);
}

export const sellerService = {
  async getMyStore() {
    const res = await fetch(apiUrl("/stores/me"), {
      headers: buildAuthHeaders(),
    });
    const payload = await handleResponse(res);
    return normalizeStore(unwrapData(payload));
  },

  async updateMyStore(payload) {
    const res = await fetch(apiUrl("/stores/me"), {
      method: "PUT",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({
        store_name: payload.storeName ?? payload.store_name,
        phone: payload.phone,
      }),
    });
    const data = await handleResponse(res);
    return normalizeStore(unwrapData(data));
  },

  async submitApplication(payload) {
    const res = await fetch(apiUrl("/seller/apply"), {
      method: "POST",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({
        store_name: payload.storeName ?? payload.store_name,
        phone: payload.phone,
      }),
    });
    const data = await handleResponse(res);
    return normalizeApplication(unwrapData(data));
  },

  async getApplicationStatus() {
    const res = await fetch(apiUrl("/seller/application"), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    const raw = unwrapData(data);
    const application = Array.isArray(raw) ? raw[0] : raw;
    return application ? normalizeApplication(application) : null;
  },

  async getSellerApplications() {
    const res = await fetch(apiUrl("/seller/application"), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return normalizeList(data, normalizeApplication);
  },

  async approveApplication(id) {
    const res = await fetch(apiUrl(`/seller/application/${id}/approve`), {
      method: "PUT",
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return normalizeApplication(unwrapData(data));
  },

  async rejectApplication(id, reason) {
    const res = await fetch(apiUrl(`/seller/application/${id}/reject`), {
      method: "PUT",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ reason }),
    });
    const data = await handleResponse(res);
    return normalizeApplication(unwrapData(data));
  },

  async getSellerOrders() {
    const res = await fetch(apiUrl("/seller/orders"), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return normalizeList(data, normalizeOrder);
  },

  async getSellerOrderById(id) {
    const res = await fetch(apiUrl(`/seller/orders/${id}`), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return normalizeOrder(unwrapData(data));
  },

  async processOrder(orderItemId) {
    const res = await fetch(apiUrl(`/seller/orders/${orderItemId}/process`), {
      method: "PUT",
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return normalizeOrder(unwrapData(data));
  },

  async readyToShipOrder(orderItemId) {
    const res = await fetch(apiUrl(`/seller/orders/${orderItemId}/ready-to-ship`), {
      method: "PUT",
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return normalizeOrder(unwrapData(data));
  },
};
