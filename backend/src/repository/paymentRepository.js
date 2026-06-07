const prisma = require("../config/database");

const findOrderById = async (orderId) => {
  return prisma.order.findUnique({
    where: { id: orderId },
  });
};

const findPaymentByOrderId = async (orderId) => {
  return prisma.payment.findUnique({
    where: { orderId },
    include: { order: true },
  });
};

const findPaymentById = async (paymentId) => {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });
};

const createPayment = async (data) => {
  return prisma.payment.create({ data });
};

const findWalletByUserId = async (userId) => {
  return prisma.wallet.findUnique({
    where: { userId },
  });
};

const updatePaymentStatus = async (tx, paymentId, status, paidAt = null) => {
  return tx.payment.update({
    where: { id: paymentId },
    data: { status, paidAt },
  });
};

const setPaymentFailed = async (paymentId) => {
  return prisma.payment.update({
    where: { id: paymentId },
    data: { status: "failed" },
  });
};

const updateOrderPaymentStatus = async (tx, orderId, status, paidAt = null) => {
  return tx.order.update({
    where: { id: orderId },
    data: { paymentStatus: status, paidAt },
  });
};

const updateWalletBalance = async (tx, walletId, newBalance) => {
  return tx.wallet.update({
    where: { id: walletId },
    data: { balance: newBalance },
  });
};

const createWalletTransaction = async (tx, data) => {
  return tx.walletTransaction.create({
    data: {
      eWalletId: data.walletId,
      type: data.type,
      amount: data.amount,
      balanceBefore: data.balanceBefore ?? 0,
      balanceAfter: data.balanceAfter,
      orderId: data.orderId,
    },
  });
};

module.exports = {
  findOrderById,
  findPaymentByOrderId,
  findPaymentById,
  createPayment,
  findWalletByUserId,
  updatePaymentStatus,
  setPaymentFailed,
  updateOrderPaymentStatus,
  updateWalletBalance,
  createWalletTransaction,
};
