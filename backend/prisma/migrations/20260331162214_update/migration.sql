/*
  Warnings:

  - The primary key for the `cart_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `cart_items` table. All the data in the column will be lost.
  - You are about to drop the column `product_list_id` on the `cart_items` table. All the data in the column will be lost.
  - You are about to drop the column `qty` on the `cart_items` table. All the data in the column will be lost.
  - The primary key for the `carts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `checked_out` on the `carts` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `carts` table. All the data in the column will be lost.
  - The primary key for the `order_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `product_list_id` on the `order_items` table. All the data in the column will be lost.
  - The primary key for the `orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `orders` table. All the data in the column will be lost.
  - The primary key for the `payments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `payments` table. All the data in the column will be lost.
  - Added the required column `cart_item_id` to the `cart_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `cart_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cart_id` to the `carts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_item_id` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `method` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_id` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `cart_items` DROP FOREIGN KEY `cart_items_cart_id_fkey`;

-- DropForeignKey
ALTER TABLE `cart_items` DROP FOREIGN KEY `cart_items_product_list_id_fkey`;

-- DropForeignKey
ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_product_list_id_fkey`;

-- DropForeignKey
ALTER TABLE `order_status_history` DROP FOREIGN KEY `order_status_history_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_cart_id_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_order_id_fkey`;

-- DropIndex
DROP INDEX `cart_items_cart_id_product_list_id_key` ON `cart_items`;

-- DropIndex
DROP INDEX `cart_items_product_list_id_fkey` ON `cart_items`;

-- DropIndex
DROP INDEX `order_items_order_id_fkey` ON `order_items`;

-- DropIndex
DROP INDEX `order_items_product_list_id_fkey` ON `order_items`;

-- DropIndex
DROP INDEX `order_status_history_order_id_fkey` ON `order_status_history`;

-- DropIndex
DROP INDEX `orders_cart_id_fkey` ON `orders`;

-- AlterTable
ALTER TABLE `cart_items` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `product_list_id`,
    DROP COLUMN `qty`,
    ADD COLUMN `cart_item_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `product_id` INTEGER NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 1,
    ADD PRIMARY KEY (`cart_item_id`);

-- AlterTable
ALTER TABLE `carts` DROP PRIMARY KEY,
    DROP COLUMN `checked_out`,
    DROP COLUMN `id`,
    ADD COLUMN `cart_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `checked_out_at` DATETIME(3) NULL,
    MODIFY `status` ENUM('active', 'checked_out', 'abandoned') NOT NULL DEFAULT 'active',
    ADD PRIMARY KEY (`cart_id`);

-- AlterTable
ALTER TABLE `order_items` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `product_list_id`,
    ADD COLUMN `order_item_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `product_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`order_item_id`);

-- AlterTable
ALTER TABLE `orders` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `order_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`order_id`);

-- AlterTable
ALTER TABLE `payments` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `method` ENUM('ewallet') NOT NULL,
    ADD COLUMN `paid_at` DATETIME(3) NULL,
    ADD COLUMN `payment_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `status` ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
    ADD PRIMARY KEY (`payment_id`);

-- CreateIndex
CREATE INDEX `cart_items_cart_id_idx` ON `cart_items`(`cart_id`);

-- CreateIndex
CREATE INDEX `cart_items_product_id_idx` ON `cart_items`(`product_id`);

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_cart_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `carts`(`cart_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_cart_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `carts`(`cart_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_status_history` ADD CONSTRAINT `order_status_history_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
