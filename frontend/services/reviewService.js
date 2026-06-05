import { apiUrl, buildAuthHeaders, handleResponse } from "./apiClient";

function unwrapData(payload) {
  return payload?.data ?? payload;
}

function normalizeReview(review = {}) {
  return {
    ...review,
    id: review.id ?? review.review_id,
    productId: review.productId ?? review.product_id ?? review.product?.id,
    productName: review.productName ?? review.product_name ?? review.product?.name ?? "Produk",
    reviewerName:
      review.reviewerName ??
      review.user?.full_name ??
      review.user?.name ??
      review.full_name ??
      "Pembeli",
    rating: Number(review.rating ?? 0),
    comment: review.comment ?? "",
    date: review.date ?? review.created_at ?? review.updated_at ?? null,
    orderItemId: review.orderItemId ?? review.order_item_id,
    status: review.status ?? "published",
  };
}

function normalizeList(payload) {
  const list = unwrapData(payload);
  return Array.isArray(list) ? list.map(normalizeReview) : [];
}

export const reviewService = {
  async createReview({ order_item_id, rating, comment }) {
    const res = await fetch(apiUrl("/reviews"), {
      method: "POST",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ order_item_id, rating, comment }),
    });
    const data = await handleResponse(res);
    return normalizeReview(unwrapData(data));
  },

  async getProductReviews(productId) {
    const res = await fetch(apiUrl(`/products/${productId}/reviews`), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return normalizeList(data);
  },

  async getProductRating(productId) {
    const res = await fetch(apiUrl(`/products/${productId}/rating`), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return unwrapData(data);
  },

  async getMyReviews() {
    const res = await fetch(apiUrl("/my/reviews"), {
      headers: buildAuthHeaders(),
    });
    const data = await handleResponse(res);
    return normalizeList(data);
  },

  async updateReview(id, payload) {
    const res = await fetch(apiUrl(`/reviews/${id}`), {
      method: "PUT",
      headers: buildAuthHeaders(true),
      body: JSON.stringify(payload),
    });
    const data = await handleResponse(res);
    return normalizeReview(unwrapData(data));
  },

  async deleteReview(id) {
    const res = await fetch(apiUrl(`/reviews/${id}`), {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });
    return handleResponse(res);
  },
};

