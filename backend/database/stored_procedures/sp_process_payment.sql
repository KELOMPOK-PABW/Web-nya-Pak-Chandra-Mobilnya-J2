-- ============================================================
-- STORED PROCEDURE: sp_process_payment
-- Memproses pembayaran: ubah status payment menjadi 'paid'
-- dan perbarui status pembayaran pada order terkait.
--
-- Parameter:
--   IN  p_payment_id INT          - ID payment yang akan dikonfirmasi
--   OUT p_message    VARCHAR(255) - Pesan hasil eksekusi
--
-- Contoh:
--   CALL sp_process_payment(1, @msg);
--   SELECT @msg AS pesan;
-- ============================================================

DROP PROCEDURE IF EXISTS sp_process_payment;

DELIMITER $$

CREATE PROCEDURE sp_process_payment(
    IN  p_payment_id INT,
    OUT p_message    VARCHAR(255)
)
BEGIN
    DECLARE v_payment_exists INT DEFAULT 0;
    DECLARE v_current_status ENUM('pending', 'paid', 'failed');
    DECLARE v_order_id       INT;

    -- Cek apakah payment ada
    SELECT COUNT(*), status, order_id
    INTO v_payment_exists, v_current_status, v_order_id
    FROM payments
    WHERE payment_id = p_payment_id;

    IF v_payment_exists = 0 THEN
        SET p_message = 'ERROR: Payment tidak ditemukan.';
        LEAVE sp_process_payment;
    END IF;

    IF v_current_status = 'paid' THEN
        SET p_message = 'ERROR: Payment sudah berstatus paid.';
        LEAVE sp_process_payment;
    END IF;

    IF v_current_status = 'failed' THEN
        SET p_message = 'ERROR: Payment sudah berstatus failed, tidak bisa diproses.';
        LEAVE sp_process_payment;
    END IF;

    START TRANSACTION;

    -- Update status payment menjadi paid
    UPDATE payments
    SET status  = 'paid',
        paid_at = NOW()
    WHERE payment_id = p_payment_id;

    -- Update status pembayaran pada order
    UPDATE orders
    SET payment_status = 'paid',
        paid_at        = NOW()
    WHERE order_id = v_order_id;

    COMMIT;

    SET p_message = 'SUCCESS: Payment berhasil diproses dan order telah diperbarui.';
END$$

DELIMITER ;
