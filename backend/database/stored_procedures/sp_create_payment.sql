-- ============================================================
-- STORED PROCEDURE: sp_create_payment
-- ============================================================

DROP PROCEDURE IF EXISTS sp_create_payment;

DELIMITER $$

CREATE PROCEDURE sp_create_payment(
    IN  p_order_id   INT,
    IN  p_method     ENUM('ewallet'),
    OUT p_payment_id INT,
    OUT p_message    VARCHAR(255)
)
-- 1. TAMBAHKAN LABEL DI SINI
proc_main: BEGIN
    DECLARE v_order_exists   INT DEFAULT 0;
    DECLARE v_already_paid   INT DEFAULT 0;
    DECLARE v_payment_exists INT DEFAULT 0;
    DECLARE v_total_amount   DECIMAL(15,2);

    -- Cek apakah order ada dan ambil total_amount
    -- Gunakan LIMIT 1 untuk memastikan hanya satu baris yang diproses
    SELECT COUNT(*), total_amount
    INTO v_order_exists, v_total_amount
    FROM orders
    WHERE order_id = p_order_id
    GROUP BY order_id, total_amount LIMIT 1;

    IF v_order_exists = 0 THEN
        SET p_payment_id = NULL;
        SET p_message    = 'ERROR: Order tidak ditemukan.';
        LEAVE proc_main; -- 2. GUNAKAN LABEL UNTUK KELUAR
    END IF;

    -- Cek apakah order sudah dibayar
    SELECT COUNT(*)
    INTO v_already_paid
    FROM orders
    WHERE order_id = p_order_id AND payment_status = 'paid';

    IF v_already_paid > 0 THEN
        SET p_payment_id = NULL;
        SET p_message    = 'ERROR: Order sudah dibayar sebelumnya.';
        LEAVE proc_main;
    END IF;

    -- Cek apakah sudah ada payment record untuk order ini yang berstatus selain 'failed'
    SELECT COUNT(*)
    INTO v_payment_exists
    FROM payments
    WHERE order_id = p_order_id AND status != 'failed';

    IF v_payment_exists > 0 THEN
        SET p_payment_id = NULL;
        SET p_message    = 'ERROR: Payment aktif untuk order ini sudah dibuat.';
        LEAVE proc_main;
    END IF;

    -- Buat payment record baru
    INSERT INTO payments (order_id, method, amount, status, created_at)
    VALUES (p_order_id, p_method, v_total_amount, 'pending', NOW());

    -- Ambil ID terakhir yang diinsert
    SET p_payment_id = LAST_INSERT_ID();
    SET p_message    = 'SUCCESS: Payment berhasil dibuat dengan status pending.';

END$$

DELIMITER ;