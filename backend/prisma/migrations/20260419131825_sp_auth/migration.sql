/*
  Warnings:

  - You are about to drop the `wallet_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wallets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `wallet_transactions` DROP FOREIGN KEY `wallet_transactions_wallet_id_fkey`;

-- DropForeignKey
ALTER TABLE `wallets` DROP FOREIGN KEY `wallets_user_id_fkey`;

-- DropTable
DROP TABLE `wallet_transactions`;

-- DropTable
DROP TABLE `wallets`;
