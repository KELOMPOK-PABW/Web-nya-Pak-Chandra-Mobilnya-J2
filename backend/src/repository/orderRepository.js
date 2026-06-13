const prisma = require("../config/database");

const findOrdersByBuyerId = async (buyerId) => {
  return prisma.order.findMany({
    where: { buyerId },
    select: {
      id: true,
      paymentStatus: true,
      totalAmount: true,
      createdAt: true,
      items: {
        select: {
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const findOrderByIdForBuyer = async (orderId, buyerId) => {
  return prisma.order.findFirst({
    where: { id: orderId, buyerId },
    include: {
      address: {
        select: {
          address: true,
          city: true,
        },
      },
      items: {
        include: {
          seller: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
  });
};

const findOrderItemsByOrderId = async (orderId) => {
  return prisma.orderItem.findMany({
    where: { orderId },
    select: {
      id: true,
      productNameSnap: true,
      status: true,
    },
  });
};

const findOrderHistoryByOrderId = async (orderId) => {
  return prisma.orderStatusHistory.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
  });
};

const updateOrderItemsStatus = async (orderId, status) => {
  return prisma.orderItem.updateMany({
    where: { orderId },
    data: { status },
  });
};

const updatePaymentStatus = async (orderId, status) => {
  return prisma.payment.updateMany({
    where: { orderId },
    data: {
      status,
      ...(status === "paid" ? { paidAt: new Date() } : {}),
    },
  });
};

const updateOrderPaymentStatus = async (orderId, paymentStatus) => {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus,
      ...(paymentStatus === "paid" ? { paidAt: new Date() } : {}),
    },
  });
};

const createOrderStatusHistory = async ({ orderId, status, updatedBy }) => {
  return prisma.orderStatusHistory.create({
    data: { orderId, status, updatedBy },
  });
};

module.exports = {
  findOrdersByBuyerId,
  findOrderByIdForBuyer,
  findOrderItemsByOrderId,
  findOrderHistoryByOrderId,
  updateOrderItemsStatus,
  updatePaymentStatus,
  updateOrderPaymentStatus,
  createOrderStatusHistory,
};
