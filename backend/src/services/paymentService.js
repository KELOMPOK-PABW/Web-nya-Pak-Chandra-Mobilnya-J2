const prisma = require("../config/database");
const paymentRepository = require("../repository/paymentRepository");

const createPayment = async ({ order_id }) => {
  const order = await paymentRepository.findOrderById(order_id);
  if (!order) {
    throw new Error("Order tidak ditemukan");
  }

  const existing = await paymentRepository.findPaymentByOrderId(order_id);
  if (existing) {
    throw new Error("Payment untuk order ini sudah ada");
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
    throw new Error("Payment tidak ditemukan");
  }
  if (payment.status !== "pending") {
    throw new Error("Payment sudah diproses");
  }

  const userId = payment.order.buyerId;
  const wallet = await paymentRepository.findEWalletByUserId(userId);
  if (!wallet) {
    throw new Error("Wallet user tidak ditemukan");
  }

  const amount = Number(payment.amount);
  const balance = Number(wallet.balance);

  if (balance < amount) {
    await paymentRepository.setPaymentFailed(payment.id);
    const err = new Error("Saldo tidak mencukupi");
    err.code = "INSUFFICIENT_BALANCE";
    throw err;
  }

  const newBalance = balance - amount;
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await paymentRepository.updateEWalletBalance(tx, wallet.id, newBalance);
    await paymentRepository.updatePaymentStatus(tx, payment.id, "paid", now);
    await paymentRepository.updateOrderPaymentStatus(
      tx,
      payment.order.id,
      "paid",
      now
    );
    await paymentRepository.createEWalletTransaction(tx, {
      eWalletId: wallet.id,
      orderId: payment.order.id,
      type: "payment",
      amount,
      balanceBefore: balance,
      balanceAfter: newBalance,
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
    throw new Error("Payment tidak ditemukan");
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
