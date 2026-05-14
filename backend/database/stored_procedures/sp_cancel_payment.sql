-- 1. Hapus SP yang lama jika ada
DROP PROCEDURE IF EXISTS sp_cancel_payment;

-- 2. Set Delimiter
DELIMITER $$

CREATE PROCEDURE sp_cancel_payment(
    IN p_payment_id INT,
    OUT p_message VARCHAR(255)
)
-- TAMBAHKAN LABEL DI SINI (Harus sama dengan yang di LEAVE)
proc_label: BEGIN
    DECLARE v_payment_exists INT DEFAULT 0;
    DECLARE v_current_status ENUM('pending', 'paid', 'failed');
    DECLARE v_order_id INT;

    -- Ambil data payment
    -- Pastikan kolom 'status' dan 'order_id' ada di tabel payments
    SELECT COUNT(*), status, order_id
    INTO v_payment_exists, v_current_status, v_order_id
    FROM payments
    WHERE payment_id = p_payment_id
    GROUP BY payment_id, status, order_id; -- Menghindari error jika hasil lebih dari 1 baris

    -- Cek jika data tidak ada
    IF v_payment_exists = 0 THEN
        SET p_message = 'ERROR: Payment tidak ditemukan.';
        LEAVE proc_label; -- Keluar dari blok BEGIN menggunakan label
    END IF;

    -- Cek jika status sudah bukan pending (misal sudah dibayar/paid)
    IF v_current_status != 'pending' THEN
        SET p_message = CONCAT('ERROR: Payment tidak bisa dibatalkan karena statusnya: ', v_current_status);
        LEAVE proc_label;
    END IF;

    -- LOGIKA PEMBATALAN (Contoh: Update status menjadi failed)
    UPDATE payments SET status = 'failed' WHERE payment_id = p_payment_id;
    
    -- Kamu mungkin juga perlu mengupdate tabel orders jika diperlukan
    -- UPDATE orders SET status = 'cancelled' WHERE id = v_order_id;

    SET p_message = 'SUCCESS: Payment berhasil dibatalkan.';

END $$

-- 3. Kembalikan Delimiter
DELIMITER ;