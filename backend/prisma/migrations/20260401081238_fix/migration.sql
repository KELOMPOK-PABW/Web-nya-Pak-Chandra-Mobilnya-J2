-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('buyer', 'seller', 'kurir') NOT NULL;

-- CreateTable
CREATE TABLE `kurir_assignments` (
    `kurir_assignment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_item_id` INTEGER NOT NULL,
    `kurir_id` INTEGER NOT NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pickup_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,

    UNIQUE INDEX `kurir_assignments_order_item_id_key`(`order_item_id`),
    PRIMARY KEY (`kurir_assignment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `kurir_assignments` ADD CONSTRAINT `kurir_assignments_order_item_id_fkey` FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`order_item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kurir_assignments` ADD CONSTRAINT `kurir_assignments_kurir_id_fkey` FOREIGN KEY (`kurir_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
