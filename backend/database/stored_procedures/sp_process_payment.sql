-- ============================================================
-- STORED PROCEDURE: sp_process_payment
-- ============================================================

DROP PROCEDURE IF EXISTS sp_process_payment;

DELIMITER $$

CREATE PROCEDURE sp_process_payment(
    IN  p_payment_id INT,
    OUT p_message    VARCHAR(255)
)
-- 1. TAMBAHKAN LABEL DI SINI
proc_main: BEGIN
    DECLARE v_payment_exists INT DEFAULT 0;
    DECLARE v_current_status ENUM('pending', 'paid', 'failed');
    DECLARE v_order_id       INT;

    -- Handler untuk error tak terduga (Opsional tapi sangat disarankan)
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_message = 'ERROR: Terjadi kesalahan sistem saat memproses transaksi.';
    END;

    -- Cek apakah payment ada
    -- Gunakan GROUP BY atau LIMIT 1 agar SELECT INTO tidak error jika data ambigu
    SELECT COUNT(*), status, order_id
    INTO v_payment_exists, v_current_status, v_order_id
    FROM payments
    WHERE payment_id = p_payment_id
    GROUP BY payment_id, status, order_id LIMIT 1;

    IF v_payment_exists = 0 THEN
        SET p_message = 'ERROR: Payment tidak ditemukan.';
        LEAVE proc_main; -- 2. GUNAKAN LABEL UNTUK KELUAR
    END IF;

    IF v_current_status = 'paid' THEN
        SET p_message = 'ERROR: Payment sudah berstatus paid.';
        LEAVE proc_main;
    END IF;

    IF v_current_status = 'failed' THEN
        SET p_message = 'ERROR: Payment sudah berstatus failed, tidak bisa diproses.';
        LEAVE proc_main;
    END IF;

    -- Mulai Transaksi agar konsisten
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

    -- Simpan perubahan
    COMMIT;

    SET p_message = 'SUCCESS: Payment berhasil diproses dan order telah diperbarui.';

END$$

DELIMITER ;