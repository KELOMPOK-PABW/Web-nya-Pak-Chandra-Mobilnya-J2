-- Replace old ewallet/ewallet_transaction tables with wallets/wallet_transactions
-- matching both the Prisma schema (Wallet -> wallets, WalletTransaction -> wallet_transactions)
-- and the stored procedures (sp_wallet_topup, sp_wallet_refund)

ALTER TABLE `ewallet_transaction` DROP FOREIGN KEY `ewallet_transaction_e_wallet_id_fkey`;
ALTER TABLE `ewallet_transaction` DROP FOREIGN KEY `ewallet_transaction_order_id_fkey`;

-- Drop old tables
DROP TABLE IF EXISTS `ewallet_transaction`;
DROP TABLE IF EXISTS `ewallet`;

-- Create wallets table
CREATE TABLE `wallets` (
    `wallet_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `balance` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wallets_user_id_key`(`user_id`),
    PRIMARY KEY (`wallet_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create wallet_transactions table
CREATE TABLE `wallet_transactions` (
    `wallet_transaction_id` INTEGER NOT NULL AUTO_INCREMENT,
    `wallet_id` INTEGER NOT NULL,
    `type` ENUM('topup', 'payment', 'refund') NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `balance_after` DECIMAL(15, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `wallet_transactions_wallet_id_idx`(`wallet_id`),
    PRIMARY KEY (`wallet_transaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign keys
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `wallet_transactions` ADD CONSTRAINT `wallet_transactions_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`wallet_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
