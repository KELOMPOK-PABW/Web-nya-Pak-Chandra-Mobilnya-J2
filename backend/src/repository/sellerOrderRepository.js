const prisma = require("../config/database");

const findOrderItemsBySellerId = async (sellerId) => {
  return prisma.orderItem.findMany({
    where: { sellerId: Number(sellerId) },
    include: {
      order: {
        select: {
          id: true,
          buyerId: true,
          buyer: { select: { fullName: true } },
        },
      },
      product: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const findOrderItemById = async (orderItemId) => {
  return prisma.orderItem.findUnique({
    where: { id: Number(orderItemId) },
    include: {
      order: { select: { buyerId: true } },
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
  findOrderItemById,
  updateOrderItemStatus,
  createStatusHistory,
};
