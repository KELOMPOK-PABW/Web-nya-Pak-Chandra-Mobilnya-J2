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

const findOrderMetaByIdForBuyer = async (orderId, buyerId) => {
  return prisma.order.findUnique({
    where: { id: orderId, buyerId },
    select: {
      id: true,
      paymentStatus: true,
      createdAt: true,
      paidAt: true,
    },
  });
};

const findStatusHistoryByOrderId = async (orderId) => {
  return prisma.orderStatusHistory.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
    select: {
      status: true,
      createdAt: true,
    },
  });
};

const findOrderWithItemsAndPayment = async (orderId, buyerId) => {
  return prisma.order.findUnique({
    where: { id: orderId, buyerId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              stock: true,
            },
          },
        },
      },
      payment: true,
    },
  });
};

const findOrderItemByIdForBuyer = async (orderItemId, buyerId) => {
  return prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: {
      order: {
        select: {
          id: true,
          buyerId: true,
        },
      },
    },
  });
};

const creditSellerWallet = async (tx, sellerId, amount, orderId) => {
  let wallet = await tx.wallet.findUnique({
    where: { userId: sellerId },
  });

  if (!wallet) {
    wallet = await tx.wallet.create({
      data: { userId: sellerId, balance: 0 },
    });
  }

  const balanceBefore = wallet.balance;
  const balanceAfter = balanceBefore + amount;

  await tx.wallet.update({
    where: { id: wallet.id },
    data: { balance: balanceAfter },
  });

  await tx.walletTransaction.create({
    data: {
      eWalletId: wallet.id,
      orderId,
      type: "payout",
      amount,
      balanceBefore,
      balanceAfter,
    },
  });
};

const cancelOrder = async (orderId, buyerId, updatedBy) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId, buyerId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                stock: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      return null;
    }

    await tx.orderItem.updateMany({
      where: { orderId },
      data: { status: "transaksi_gagal" },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: "failed" },
    });

    if (order.payment) {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: { status: "failed" },
      });
    }

    for (const item of order.items) {
      const newStock = item.product.stock + item.qty;
      await tx.product.update({
        where: { id: item.product.id },
        data: {
          stock: newStock,
          stockStatus: newStock === 0 ? "habis" : "tersedia",
        },
      });
    }

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: "transaksi_gagal",
        updatedBy,
      },
    });

    return order;
  });
};

const confirmOrderReceived = async (orderId, buyerId, updatedBy) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId, buyerId },
      include: { items: true },
    });

    if (!order) {
      return null;
    }

    await tx.orderItem.updateMany({
      where: { orderId },
      data: { status: "diterima_pembeli" },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: "diterima_pembeli",
        updatedBy,
      },
    });

    for (const item of order.items) {
      const amount = item.priceSnap * item.qty;
      await creditSellerWallet(tx, item.sellerId, amount, orderId);
    }

    return order;
  });
};

const completeOrderItem = async (orderItemId, buyerId, updatedBy) => {
  return prisma.$transaction(async (tx) => {
    const item = await tx.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: {
          select: {
            id: true,
            buyerId: true,
          },
        },
      },
    });

    if (!item || item.order.buyerId !== buyerId) {
      return null;
    }

    const completedAt = new Date();

    const updated = await tx.orderItem.update({
      where: { id: orderItemId },
      data: { status: "diterima_pembeli" },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: item.orderId,
        status: "diterima_pembeli",
        updatedBy,
      },
    });

    const amount = item.priceSnap * item.qty;
    await creditSellerWallet(tx, item.sellerId, amount, item.orderId);

    return { item: updated, completedAt };
  });
};

module.exports = {
  findOrdersByBuyerId,
  findOrderByIdForBuyer,
  findOrderItemsByOrderId,
  findOrderMetaByIdForBuyer,
  findStatusHistoryByOrderId,
  findOrderWithItemsAndPayment,
  findOrderItemByIdForBuyer,
  cancelOrder,
  confirmOrderReceived,
  completeOrderItem,
};
