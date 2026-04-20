-- CreateTable
CREATE TABLE `wallets` (
    `wallet_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `balance` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wallets_user_id_key`(`user_id`),
    PRIMARY KEY (`wallet_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
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

-- AddForeignKey
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_transactions` ADD CONSTRAINT `wallet_transactions_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`wallet_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
