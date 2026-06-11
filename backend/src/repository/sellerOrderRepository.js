const prisma = require("../config/database");

const orderItemInclude = {
  order: {
    include: {
      buyer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      address: {
        select: {
          address: true,
          city: true,
          postalCode: true,
        },
      },
    },
  },
  product: {
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  },
};

const findBySellerId = async (sellerId) => {
  return prisma.orderItem.findMany({
    where: { sellerId },
    include: orderItemInclude,
    orderBy: { createdAt: "desc" },
  });
};

const findByIdAndSellerId = async (id, sellerId) => {
  return prisma.orderItem.findFirst({
    where: { id, sellerId },
    include: orderItemInclude,
  });
};

const updateStatus = async (id, sellerId, status) => {
  return prisma.orderItem.updateMany({
    where: { id, sellerId },
    data: { status },
  });
};

const createHistory = async ({ orderId, status, updatedBy }) => {
  return prisma.orderStatusHistory.create({
    data: { orderId, status, updatedBy },
  });
};

module.exports = {
  findBySellerId,
  findByIdAndSellerId,
  updateStatus,
  createHistory,
};
