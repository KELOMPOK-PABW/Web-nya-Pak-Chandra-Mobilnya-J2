const prisma = require("../config/database");

const findOrdersByBuyerId = async (buyerId) => {
  return prisma.order.findMany({
    where: { buyerId },
    select: {
      id: true,
      paymentStatus: true,
      totalAmount: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const findOrderByIdForBuyer = async (orderId, buyerId) => {
  return prisma.order.findUnique({
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
              full_name: true,
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

module.exports = {
  findOrdersByBuyerId,
  findOrderByIdForBuyer,
  findOrderItemsByOrderId,
};
