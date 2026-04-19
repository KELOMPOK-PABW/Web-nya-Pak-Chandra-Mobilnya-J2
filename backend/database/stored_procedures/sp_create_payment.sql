-- ============================================================
-- STORED PROCEDURE: sp_create_payment
-- Membuat record pembayaran baru dengan status 'pending'
-- untuk sebuah order yang sudah ada.
--
-- Parameter:
--   IN  p_order_id   INT             - ID order yang akan dibayar
--   IN  p_method     ENUM('ewallet') - Metode pembayaran
--   OUT p_payment_id INT             - ID payment yang baru dibuat
--   OUT p_message    VARCHAR(255)    - Pesan hasil eksekusi
--
-- Contoh:
--   CALL sp_create_payment(1, 'ewallet', @pid, @msg);
--   SELECT @pid AS payment_id, @msg AS pesan;
-- ============================================================

DROP PROCEDURE IF EXISTS sp_create_payment;

DELIMITER $$

CREATE PROCEDURE sp_create_payment(
    IN  p_order_id   INT,
    IN  p_method     ENUM('ewallet'),
    OUT p_payment_id INT,
    OUT p_message    VARCHAR(255)
)
BEGIN
    DECLARE v_order_exists   INT DEFAULT 0;
    DECLARE v_already_paid   INT DEFAULT 0;
    DECLARE v_payment_exists INT DEFAULT 0;
    DECLARE v_total_amount   DECIMAL(15,2);

    -- Cek apakah order ada
    SELECT COUNT(*), total_amount
    INTO v_order_exists, v_total_amount
    FROM orders
    WHERE order_id = p_order_id;

    IF v_order_exists = 0 THEN
        SET p_payment_id = NULL;
        SET p_message    = 'ERROR: Order tidak ditemukan.';
        LEAVE sp_create_payment;
    END IF;

    -- Cek apakah order sudah dibayar
    SELECT COUNT(*)
    INTO v_already_paid
    FROM orders
    WHERE order_id = p_order_id AND payment_status = 'paid';

    IF v_already_paid > 0 THEN
        SET p_payment_id = NULL;
        SET p_message    = 'ERROR: Order sudah dibayar sebelumnya.';
        LEAVE sp_create_payment;
    END IF;

    -- Cek apakah sudah ada payment record untuk order ini
    SELECT COUNT(*)
    INTO v_payment_exists
    FROM payments
    WHERE order_id = p_order_id;

    IF v_payment_exists > 0 THEN
        SET p_payment_id = NULL;
        SET p_message    = 'ERROR: Payment untuk order ini sudah dibuat.';
        LEAVE sp_create_payment;
    END IF;

    -- Buat payment record baru
    INSERT INTO payments (order_id, method, amount, status, created_at)
    VALUES (p_order_id, p_method, v_total_amount, 'pending', NOW());

    SET p_payment_id = LAST_INSERT_ID();
    SET p_message    = 'SUCCESS: Payment berhasil dibuat dengan status pending.';
END$$

DELIMITER ;
