-- AlterTable
ALTER TABLE `chat_messages` ADD COLUMN `entities` JSON NULL AFTER `suggested_product_ids`;
