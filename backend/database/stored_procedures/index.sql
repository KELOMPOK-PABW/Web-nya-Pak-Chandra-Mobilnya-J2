-- ============================================================
-- index.sql
-- Menjalankan semua stored procedure sekaligus.
-- Jalankan file ini untuk mendaftarkan semua SP ke database.
--
-- Cara pakai (jalankan dari root folder backend/):
--   mysql -u <user> -p <database> < database/stored_procedures/index.sql
--
-- Atau jalankan langsung dari folder stored_procedures/:
--   mysql -u <user> -p <database> < index.sql
-- ============================================================

SOURCE database/stored_procedures/sp_create_payment.sql;
SOURCE database/stored_procedures/sp_process_payment.sql;
SOURCE database/stored_procedures/sp_cancel_payment.sql;
SOURCE database/stored_procedures/sp_add_item_to_cart.sql;
SOURCE database/stored_procedures/sp_wallet_topup.sql;
SOURCE database/stored_procedures/sp_wallet_refund.sql;
