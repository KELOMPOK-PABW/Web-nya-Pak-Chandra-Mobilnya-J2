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

const findOrderItemsBySellerId = async (sellerId, { skip = 0, take = 10 } = {}) => {
  return prisma.orderItem.findMany({
    where: { sellerId: Number(sellerId) },
    include: orderItemInclude,
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

const findOrderItemById = async (orderItemId) => {
  return prisma.orderItem.findUnique({
    where: { id: Number(orderItemId) },
    include: orderItemInclude,
  });
};

const findOrderByIdForSeller = async (orderId, sellerId) => {
  return prisma.order.findUnique({
    where: { id: Number(orderId) },
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
      items: {
        where: { sellerId: Number(sellerId) },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
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
  findOrderItemById,
  findOrderByIdForSeller,
  updateOrderItemStatus,
  createStatusHistory,
};
