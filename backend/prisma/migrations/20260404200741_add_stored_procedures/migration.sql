-- Migration: add_stored_procedures
-- Mendaftarkan semua stored procedure ke database.
-- Dijalankan otomatis oleh: prisma migrate deploy

-- ============================================================
-- SP: sp_create_payment
-- ============================================================
DROP PROCEDURE IF EXISTS sp_create_payment;

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

    SELECT COUNT(*), total_amount
    INTO v_order_exists, v_total_amount
    FROM orders
    WHERE order_id = p_order_id;

    IF v_order_exists = 0 THEN
        SET p_payment_id = NULL;
        SET p_message    = 'ERROR: Order tidak ditemukan.';
    ELSE
        SELECT COUNT(*)
        INTO v_already_paid
        FROM orders
        WHERE order_id = p_order_id AND payment_status = 'paid';

        IF v_already_paid > 0 THEN
            SET p_payment_id = NULL;
            SET p_message    = 'ERROR: Order sudah dibayar sebelumnya.';
        ELSE
            SELECT COUNT(*)
            INTO v_payment_exists
            FROM payments
            WHERE order_id = p_order_id;

            IF v_payment_exists > 0 THEN
                SET p_payment_id = NULL;
                SET p_message    = 'ERROR: Payment untuk order ini sudah dibuat.';
            ELSE
                INSERT INTO payments (order_id, method, amount, status, created_at)
                VALUES (p_order_id, p_method, v_total_amount, 'pending', NOW());

                SET p_payment_id = LAST_INSERT_ID();
                SET p_message    = 'SUCCESS: Payment berhasil dibuat dengan status pending.';
            END IF;
        END IF;
    END IF;
END;

-- ============================================================
-- SP: sp_process_payment
-- ============================================================
DROP PROCEDURE IF EXISTS sp_process_payment;

CREATE PROCEDURE sp_process_payment(
    IN  p_payment_id INT,
    OUT p_message    VARCHAR(255)
)
BEGIN
    DECLARE v_payment_exists INT DEFAULT 0;
    DECLARE v_current_status ENUM('pending', 'paid', 'failed');
    DECLARE v_order_id       INT;

    SELECT COUNT(*), status, order_id
    INTO v_payment_exists, v_current_status, v_order_id
    FROM payments
    WHERE payment_id = p_payment_id;

    IF v_payment_exists = 0 THEN
        SET p_message = 'ERROR: Payment tidak ditemukan.';
    ELSEIF v_current_status = 'paid' THEN
        SET p_message = 'ERROR: Payment berstatus paid.';
    ELSEIF v_current_status = 'failed' THEN
        SET p_message = 'ERROR: Payment berstatus failed, tidak bisa diproses.';
    ELSE
        START TRANSACTION;

        UPDATE payments
        SET status  = 'paid',
            paid_at = NOW()
        WHERE payment_id = p_payment_id;

        UPDATE orders
        SET payment_status = 'paid',
            paid_at        = NOW()
        WHERE order_id = v_order_id;

        COMMIT;

        SET p_message = 'SUCCESS: Payment berhasil diproses dan order telah diperbarui.';
    END IF;
END;

-- ============================================================
-- SP: sp_cancel_payment
-- ============================================================
DROP PROCEDURE IF EXISTS sp_cancel_payment;

CREATE PROCEDURE sp_cancel_payment(
    IN  p_payment_id INT,
    OUT p_message    VARCHAR(255)
)
BEGIN
    DECLARE v_payment_exists INT DEFAULT 0;
    DECLARE v_current_status ENUM('pending', 'paid', 'failed');
    DECLARE v_order_id       INT;

    SELECT COUNT(*), status, order_id
    INTO v_payment_exists, v_current_status, v_order_id
    FROM payments
    WHERE payment_id = p_payment_id;

    IF v_payment_exists = 0 THEN
        SET p_message = 'ERROR: Payment tidak ditemukan.';
    ELSEIF v_current_status != 'pending' THEN
        SET p_message = CONCAT('ERROR: Hanya payment berstatus pending yang bisa dibatalkan. Status saat ini: ', v_current_status);
    ELSE
        START TRANSACTION;

        UPDATE payments
        SET status = 'failed'
        WHERE payment_id = p_payment_id;

        UPDATE orders
        SET payment_status = 'failed'
        WHERE order_id = v_order_id;

        COMMIT;

        SET p_message = 'SUCCESS: Payment berhasil dibatalkan.';
    END IF;
END;


