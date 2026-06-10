const prisma = require("../config/database");

const findOrderItemsBySellerId = async (sellerId, { skip = 0, take = 10 } = {}) => {
  return prisma.orderItem.findMany({
    where: { sellerId: Number(sellerId) },
    include: {
      order: {
        select: {
          id: true,
          buyer: { select: { fullName: true } },
        },
      },
      product: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
};

const countOrderItemsBySellerId = async (sellerId) => {
  return prisma.orderItem.count({
    where: { sellerId: Number(sellerId) },
  });
};

const findOrderByIdForSeller = async (orderId, sellerId) => {
  return prisma.order.findUnique({
    where: { id: Number(orderId) },
    include: {
      buyer: {
        select: {
          fullName: true,
          phone: true,
        },
      },
      address: {
        select: {
          address: true,
          city: true,
        },
      },
      items: {
        where: { sellerId: Number(sellerId) },
        orderBy: { createdAt: "asc" },
      },
    },
  });
};

const findOrderItemById = async (orderItemId) => {
  return prisma.orderItem.findUnique({
    where: { id: Number(orderItemId) },
    include: {
      order: { select: { id: true, buyerId: true } },
    },
  });
};

const updateOrderItemStatus = async (orderItemId, status) => {
  return prisma.orderItem.update({
    where: { id: Number(orderItemId) },
    data: { status },
  });
};

const createStatusHistory = async (data) => {
  return prisma.orderStatusHistory.create({ data });
};

module.exports = {
  findOrderItemsBySellerId,
  countOrderItemsBySellerId,
  findOrderByIdForSeller,
  findOrderItemById,
  updateOrderItemStatus,
  createStatusHistory,
};
