const prisma = require("../config/database");

const create = async (data) => {
  return prisma.review.create({
    data,
    include: {
      reviewer: { select: { id: true, full_name: true } },
      product: { select: { id: true, name: true } },
    },
  });
};

const findById = async (id) => {
  return prisma.review.findUnique({
    where: { id: Number(id) },
    include: {
      reviewer: { select: { id: true, full_name: true } },
      product: { select: { id: true, name: true } },
    },
  });
};

const findAll = async ({ skip, take }) => {
  return prisma.review.findMany({
    skip,
    take,
    orderBy: { createdAt: "desc" },
    include: {
      reviewer: { select: { id: true, full_name: true } },
      product: { select: { id: true, name: true } },
    },
  });
};

const countAll = async () => {
  return prisma.review.count();
};

const findByReviewerId = async (reviewerId, { skip, take }) => {
  return prisma.review.findMany({
    where: { reviewerId: Number(reviewerId) },
    skip,
    take,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, name: true } },
    },
  });
};

const countByReviewerId = async (reviewerId) => {
  return prisma.review.count({
    where: { reviewerId: Number(reviewerId) },
  });
};

const findByProductId = async (productId, { skip, take }) => {
  return prisma.review.findMany({
    where: { productListId: Number(productId) },
    skip,
    take,
    orderBy: { createdAt: "desc" },
    include: {
      reviewer: { select: { id: true, full_name: true } },
    },
  });
};

const countByProductId = async (productId) => {
  return prisma.review.count({
    where: { productListId: Number(productId) },
  });
};

const getAverageRatingByProductId = async (productId) => {
  const result = await prisma.review.aggregate({
    where: { productListId: Number(productId) },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    average_rating: result._avg.rating ? parseFloat(result._avg.rating.toFixed(1)) : 0,
    total_reviews: result._count.rating,
  };
};

const update = async (id, data) => {
  return prisma.review.update({
    where: { id: Number(id) },
    data,
    include: {
      reviewer: { select: { id: true, full_name: true } },
      product: { select: { id: true, name: true } },
    },
  });
};

const deleteById = async (id) => {
  return prisma.review.delete({
    where: { id: Number(id) },
  });
};

const findExistingReviewByOrderItem = async (reviewerId, orderItemId) => {
  return prisma.review.findFirst({
    where: {
      reviewerId: Number(reviewerId),
      orderItemsId: Number(orderItemId),
    },
  });
};

const findOrderItemById = async (orderItemId) => {
  return prisma.orderItem.findUnique({
    where: { id: Number(orderItemId) },
    include: {
      product: { select: { id: true, name: true } },
      order: { select: { id: true, buyerId: true } },
    },
  });
};

module.exports = {
  create,
  findById,
  findAll,
  countAll,
  findByReviewerId,
  countByReviewerId,
  findByProductId,
  countByProductId,
  getAverageRatingByProductId,
  update,
  deleteById,
  findExistingReviewByOrderItem,
  findOrderItemById,
};
