const reviewRepository = require("../repository/reviewRepository");

const formatReviewResponse = (review) => {
  return {
    review_id: review.id,
    rating: review.rating,
    comment: review.comment,
    created_at: review.createdAt,
    updated_at: review.updatedAt,
  };
};

const formatProductReviewResponse = (review) => {
  return {
    user: review.reviewer
      ? { name: review.reviewer.full_name }
      : null,
    rating: review.rating,
    comment: review.comment,
    created_at: review.createdAt,
  };
};

const formatMyReviewResponse = (review) => {
  return {
    product_name: review.product ? review.product.name : null,
    rating: review.rating,
    comment: review.comment,
  };
};

const createReview = async (data, userId) => {
  const { order_item_id, rating, comment } = data;

  // 1. Cek order_item exists
  const orderItem = await reviewRepository.findOrderItemById(order_item_id);
  if (!orderItem) {
    throw new Error("Order item tidak ditemukan");
  }

  // 2. Cek order_item milik user
  if (orderItem.order.buyerId !== userId) {
    throw new Error("Akses ditolak");
  }

  // 3. Cek status = diterima_pembeli
  if (orderItem.status !== "diterima_pembeli") {
    throw new Error("Belum bisa review");
  }

  // 4. Cek belum pernah review order_item ini
  const existing = await reviewRepository.findExistingReviewByOrderItem(userId, order_item_id);
  if (existing) {
    throw new Error("Sudah pernah review");
  }

  // 5. Insert review
  const reviewData = {
    productListId: orderItem.productId,
    orderItemsId: orderItem.order.id,
    reviewerId: Number(userId),
    rating: Number(rating),
    comment: comment || null,
  };

  const review = await reviewRepository.create(reviewData);
  return formatReviewResponse(review);
};

const getAllReviews = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const take = limit;

  const [reviews, totalItems] = await Promise.all([
    reviewRepository.findAll({ skip, take }),
    reviewRepository.countAll(),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    reviews: reviews.map(formatReviewResponse),
    meta: {
      page,
      limit,
      total_items: totalItems,
      total_pages: totalPages,
    },
  };
};

const getMyReviews = async (userId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const take = limit;

  const [reviews, totalItems] = await Promise.all([
    reviewRepository.findByReviewerId(userId, { skip, take }),
    reviewRepository.countByReviewerId(userId),
  ]);

  return {
    reviews: reviews.map(formatMyReviewResponse),
  };
};

const getReviewById = async (id) => {
  const review = await reviewRepository.findById(id);
  if (!review) {
    throw new Error("Review tidak ditemukan");
  }
  return formatReviewResponse(review);
};

const updateReview = async (id, data, userId) => {
  const review = await reviewRepository.findById(id);
  if (!review) {
    throw new Error("Review tidak ditemukan");
  }

  if (review.reviewerId !== userId) {
    throw new Error("Akses ditolak");
  }

  const updateData = {};
  if (data.rating !== undefined) updateData.rating = Number(data.rating);
  if (data.comment !== undefined) updateData.comment = data.comment;

  const updated = await reviewRepository.update(id, updateData);
  return {
    review_id: updated.id,
    rating: updated.rating,
    comment: updated.comment,
    is_edited: true,
  };
};

const deleteReview = async (id, userId) => {
  const review = await reviewRepository.findById(id);
  if (!review) {
    throw new Error("Review tidak ditemukan");
  }

  if (review.reviewerId !== userId) {
    throw new Error("Akses ditolak");
  }

  await reviewRepository.deleteById(id);
  return { message: "Review berhasil dihapus" };
};

const getProductReviews = async (productId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const take = limit;

  const [reviews, totalItems] = await Promise.all([
    reviewRepository.findByProductId(productId, { skip, take }),
    reviewRepository.countByProductId(productId),
  ]);

  return {
    reviews: reviews.map(formatProductReviewResponse),
  };
};

const getProductRating = async (productId) => {
  return reviewRepository.getAverageRatingByProductId(productId);
};

module.exports = {
  createReview,
  getAllReviews,
  getMyReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getProductReviews,
  getProductRating,
};
