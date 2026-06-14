const prisma = require("../config/database");
const walletRepository = require("../repository/walletRepository");

const getBalance = async (userId) => {
  let wallet = await walletRepository.findWalletByUserId(userId);
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId },
    });
  }
  return {
    balance: Number(wallet.balance),
  };
};

const getTransactions = async (userId) => {
  const wallet = await walletRepository.findWalletByUserId(userId);
  if (!wallet) {
    return [];
  }
  const transactions = await walletRepository.findTransactionsByWalletId(wallet.id);

  return transactions.map((t) => ({
    type: t.type,
    amount: Number(t.amount),
    balance_after: Number(t.balanceAfter),
    created_at: t.createdAt,
  }));
};

const topup = async (userId, amount) => {
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) {
    const err = new Error("Jumlah topup harus berupa angka positif.");
    err.status = 400;
    err.expose = true;
    throw err;
  }
  // ensure integer amount because DB schema uses Int for balances/amounts
  const safeAmount = Math.round(amt);

  const result = await walletRepository.callTopupSP(userId, safeAmount);
  if (result.message && result.message.startsWith("ERROR")) {
    const err = new Error(result.message.replace("ERROR: ", ""));
    err.status = 400;
    err.expose = true;
    throw err;
  }

  return { balance_after: Number(result.balance_after) };
};

const refund = async (userId, orderId) => {
  const oid = Number(orderId);
  if (!Number.isInteger(oid) || oid <= 0) {
    const err = new Error("Order ID tidak valid.");
    err.status = 400;
    err.expose = true;
    throw err;
  }

  const result = await walletRepository.callRefundSP(userId, oid);
  if (result.message && result.message.startsWith("ERROR")) {
    const err = new Error(result.message.replace("ERROR: ", ""));
    err.status = 400;
    err.expose = true;
    throw err;
  }

  return { balance_after: Number(result.balance_after) };
};

module.exports = {
  getBalance,
  getTransactions,
  topup,
  refund,
};
