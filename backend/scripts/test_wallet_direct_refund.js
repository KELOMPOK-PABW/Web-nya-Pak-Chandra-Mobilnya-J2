const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = Number(process.argv[2] || 10);
  const orderId = Number(process.argv[3] || 4);

  try {
    const payment = await prisma.payment.findFirst({ where: { orderId } });
    if (!payment) {
      console.error('Payment not found for order', orderId);
      process.exit(1);
    }
    if (payment.status !== 'paid') {
      console.error('Payment not in paid status:', payment.status);
      process.exit(1);
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      console.error('Wallet not found for user', userId);
      process.exit(1);
    }

    const refundAmount = Number(payment.amount);
    const result = await prisma.$transaction(async (tx) => {
      const newBalance = Number(wallet.balance) + refundAmount;
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });
      await tx.walletTransaction.create({ data: { eWalletId: wallet.id, type: 'refund', amount: refundAmount, balanceBefore: Number(wallet.balance), balanceAfter: newBalance, orderId } });
      await tx.payment.update({ where: { id: payment.id }, data: { status: 'refunded' } });
      return { balance_after: newBalance };
    });

    console.log('Direct refund result:', result);
  } catch (err) {
    console.error('Direct refund error:', err && err.message ? err.message : err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
