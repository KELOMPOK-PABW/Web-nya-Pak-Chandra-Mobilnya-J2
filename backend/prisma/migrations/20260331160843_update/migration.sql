/*
  Warnings:

  - The primary key for the `addresses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `detail` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `addresses` table. All the data in the column will be lost.
  - Added the required column `address` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address_id` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postal_code` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_address_id_fkey`;

-- DropIndex
DROP INDEX `orders_address_id_fkey` ON `orders`;

-- AlterTable
ALTER TABLE `addresses` DROP PRIMARY KEY,
    DROP COLUMN `detail`,
    DROP COLUMN `id`,
    ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `address_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `city` VARCHAR(191) NOT NULL,
    ADD COLUMN `postal_code` VARCHAR(191) NOT NULL,
    ADD COLUMN `user_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`address_id`);

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_address_id_fkey` FOREIGN KEY (`address_id`) REFERENCES `addresses`(`address_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
