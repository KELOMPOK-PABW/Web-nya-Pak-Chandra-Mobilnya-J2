const prisma = require("../config/database");
const paymentRepository = require("../repository/paymentRepository");

const createPayment = async ({ order_id }) => {
  const order = await paymentRepository.findOrderById(order_id);
  if (!order) {
    const err = new Error("Order tidak ditemukan");
    err.status = 404;
    err.expose = true;
    throw err;
  }

  const existing = await paymentRepository.findPaymentByOrderId(order_id);
  if (existing) {
    const err = new Error("Payment untuk order ini sudah ada");
    err.status = 409;
    err.expose = true;
    throw err;
  }

  const payment = await paymentRepository.createPayment({
    orderId: order.id,
    method: "ewallet",
    amount: order.totalAmount,
    status: "pending",
  });

  return {
    payment_id: payment.id,
    status: payment.status,
  };
};

const payPayment = async (paymentId) => {
  const payment = await paymentRepository.findPaymentById(paymentId);
  if (!payment) {
    const err = new Error("Payment tidak ditemukan");
    err.status = 404;
    err.expose = true;
    throw err;
  }
  if (payment.status !== "pending") {
    const err = new Error("Payment sudah diproses");
    err.status = 400;
    err.expose = true;
    throw err;
  }

  const userId = payment.order.buyerId;
  const wallet = await paymentRepository.findWalletByUserId(userId);
  if (!wallet) {
    const err = new Error("Wallet user tidak ditemukan");
    err.status = 404;
    err.expose = true;
    throw err;
  }

  const amount = Number(payment.amount);
  const balance = Number(wallet.balance);

  if (balance < amount) {
    await paymentRepository.setPaymentFailed(payment.id);
    const err = new Error("Saldo tidak mencukupi");
    err.code = "INSUFFICIENT_BALANCE";
    err.status = 400;
    throw err;
  }

  const newBalance = balance - amount;
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await paymentRepository.updateWalletBalance(tx, wallet.id, newBalance);
    await paymentRepository.updatePaymentStatus(tx, payment.id, "paid", now);
    await paymentRepository.updateOrderPaymentStatus(
      tx,
      payment.order.id,
      "paid",
      now
    );
    await paymentRepository.createWalletTransaction(tx, {
      walletId: wallet.id,
      type: "payment",
      amount,
      balanceBefore: balance,
      balanceAfter: newBalance,
      orderId: payment.order.id,
    });
  });

  return {
    status: "paid",
    balance_after: newBalance,
  };
};

const getPaymentByOrderId = async (orderId) => {
  const payment = await paymentRepository.findPaymentByOrderId(orderId);
  if (!payment) {
    const err = new Error("Payment tidak ditemukan");
    err.status = 404;
    err.expose = true;
    throw err;
  }

  return {
    order_id: payment.orderId,
    amount: Number(payment.amount),
    method: payment.method,
    status: payment.status,
    paid_at: payment.paidAt,
  };
};

module.exports = {
  createPayment,
  payPayment,
  getPaymentByOrderId,
};
