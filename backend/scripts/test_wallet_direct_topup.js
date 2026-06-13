const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = Number(process.argv[2] || 10);
  const amount = Number(process.argv[3] || 20000);

  try {
    const result = await prisma.$transaction(async (tx) => {
      let wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        wallet = await tx.wallet.create({ data: { userId, balance: 0 } });
      }
      const newBalance = Number(wallet.balance) + amount;
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });
      await tx.walletTransaction.create({ data: { eWalletId: wallet.id, type: 'topup', amount, balanceBefore: Number(wallet.balance), balanceAfter: newBalance } });
      return { balance_after: newBalance };
    });

    console.log('Direct topup result:', result);
  } catch (err) {
    console.error('Direct topup error:', err && err.message ? err.message : err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
