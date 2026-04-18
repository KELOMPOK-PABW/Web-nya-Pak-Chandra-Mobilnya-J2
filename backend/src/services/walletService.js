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
  const result = await walletRepository.callTopupSP(userId, amount);

  if (result.message.startsWith("ERROR")) {
    throw new Error(result.message.replace("ERROR: ", ""));
  }

  return { balance_after: Number(result.balance_after) };
};

const refund = async (userId, orderId) => {
  const result = await walletRepository.callRefundSP(userId, orderId);

  if (result.message.startsWith("ERROR")) {
    throw new Error(result.message.replace("ERROR: ", ""));
  }

  return { balance_after: Number(result.balance_after) };
};

module.exports = {
  getBalance,
  getTransactions,
  topup,
  refund,
};
