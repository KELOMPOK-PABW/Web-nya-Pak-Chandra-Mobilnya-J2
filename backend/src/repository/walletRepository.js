const prisma = require("../config/database");

const findWalletByUserId = async (userId) => {
  return prisma.wallet.findUnique({
    where: { userId },
  });
};

const findTransactionsByWalletId = async (walletId) => {
  return prisma.walletTransaction.findMany({
    where: { walletId },
    orderBy: { createdAt: "desc" },
  });
};

const callTopupSP = async (userId, amount) => {
  await prisma.$queryRaw`CALL sp_wallet_topup(${userId}, ${amount}, @bal, @msg)`;
  const [result] = await prisma.$queryRaw`SELECT @bal AS balance_after, @msg AS message`;
  return result;
};

const callRefundSP = async (userId, orderId) => {
  await prisma.$queryRaw`CALL sp_wallet_refund(${userId}, ${orderId}, @bal, @msg)`;
  const [result] = await prisma.$queryRaw`SELECT @bal AS balance_after, @msg AS message`;
  return result;
};

module.exports = {
  findWalletByUserId,
  findTransactionsByWalletId,
  callTopupSP,
  callRefundSP,
};
