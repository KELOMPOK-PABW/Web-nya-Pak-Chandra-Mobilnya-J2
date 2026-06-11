const prisma = require("../config/database");

const findWalletByUserId = async (userId) => {
  return prisma.wallet.findUnique({
    where: { userId },
  });
};

const findTransactionsByWalletId = async (walletId) => {
  return prisma.walletTransaction.findMany({
    where: { eWalletId: walletId },
    orderBy: { createdAt: "desc" },
  });
};

const callTopupSP = async (userId, amount) => {
  try {
    await prisma.$queryRaw`CALL sp_wallet_topup(${userId}, ${amount}, @bal, @msg)`;
    const [result] = await prisma.$queryRaw`SELECT @bal AS balance_after, @msg AS message`;
    return result;
  } catch (err) {
    // Fallback: if stored procedure not available, implement topup in JS
    // Prisma error for missing procedure surfaces as P2010 / code 1305
    try {
      if (Number(amount) <= 0) {
        return { balance_after: null, message: 'ERROR: Jumlah topup harus lebih dari 0.' };
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return { balance_after: null, message: 'ERROR: User tidak ditemukan.' };
      }

      const result = await prisma.$transaction(async (tx) => {
        let wallet = await tx.wallet.findUnique({ where: { userId } });
        if (!wallet) {
          wallet = await tx.wallet.create({ data: { userId, balance: 0 } });
        }

        const newBalance = Number(wallet.balance) + Number(amount);
        await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });
        await tx.walletTransaction.create({ data: { eWalletId: wallet.id, type: 'topup', amount, balanceBefore: Number(wallet.balance), balanceAfter: newBalance } });

        return { balance_after: newBalance, message: `SUCCESS: Top up sebesar ${amount} berhasil.` };
      });

      return result;
    } catch (innerErr) {
      throw innerErr;
    }
  }
};

const callRefundSP = async (userId, orderId) => {
  try {
    await prisma.$queryRaw`CALL sp_wallet_refund(${userId}, ${orderId}, @bal, @msg)`;
    const [result] = await prisma.$queryRaw`SELECT @bal AS balance_after, @msg AS message`;
    return result;
  } catch (err) {
    // Fallback: basic refund implementation if SP missing
    try {
      const payment = await prisma.payment.findFirst({ where: { orderId } });
      if (!payment) {
        return { balance_after: null, message: 'ERROR: Payment tidak ditemukan.' };
      }
      if (payment.status !== 'paid') {
        return { balance_after: null, message: 'ERROR: Payment belum dibayar.' };
      }

      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        return { balance_after: null, message: 'ERROR: Wallet user tidak ditemukan.' };
      }

      const refundAmount = Number(payment.amount);
      const result = await prisma.$transaction(async (tx) => {
        const newBalance = Number(wallet.balance) + refundAmount;
        await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });
        await tx.walletTransaction.create({ data: { eWalletId: wallet.id, type: 'refund', amount: refundAmount, balanceAfter: newBalance, orderId } });
        // mark payment refunded if desired
        await tx.payment.update({ where: { id: payment.id }, data: { status: 'refunded' } });
        return { balance_after: newBalance, message: `SUCCESS: Refund untuk order ${orderId} berhasil.` };
      });

      return result;
    } catch (innerErr) {
      throw innerErr;
    }
  }
};

module.exports = {
  findWalletByUserId,
  findTransactionsByWalletId,
  callTopupSP,
  callRefundSP,
};
