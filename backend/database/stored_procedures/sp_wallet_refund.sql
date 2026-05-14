-- ============================================================
-- STORED PROCEDURE: sp_wallet_refund
-- ============================================================

DROP PROCEDURE IF EXISTS sp_wallet_refund;

DELIMITER $$

CREATE PROCEDURE sp_wallet_refund(
    IN  p_user_id       INT,
    IN  p_order_id      INT,
    OUT p_balance_after DECIMAL(15,2),
    OUT p_message       VARCHAR(255)
)
-- 1. TAMBAHKAN LABEL DI SINI
proc_main: BEGIN
    DECLARE v_order_exists    INT DEFAULT 0;
    DECLARE v_buyer_id        INT;
    DECLARE v_payment_status  VARCHAR(20);
    DECLARE v_total_amount    DECIMAL(15,2);
    DECLARE v_wallet_id       INT DEFAULT 0;
    DECLARE v_current_bal     DECIMAL(15,2) DEFAULT 0;

    -- Handler untuk rollback jika terjadi error di tengah jalan
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_message = 'ERROR: Terjadi kesalahan sistem saat proses refund.';
    END;

    -- Cek apakah order ada
    SELECT COUNT(*), buyer_id, payment_status, total_amount
    INTO v_order_exists, v_buyer_id, v_payment_status, v_total_amount
    FROM orders
    WHERE order_id = p_order_id
    GROUP BY order_id, buyer_id, payment_status, total_amount LIMIT 1;

    IF v_order_exists = 0 THEN
        SET p_balance_after = NULL;
        SET p_message       = 'ERROR: Order tidak ditemukan.';
        LEAVE proc_main; -- 2. GUNAKAN LABEL
    END IF;

    -- Cek apakah order milik user
    IF v_buyer_id != p_user_id THEN
        SET p_balance_after = NULL;
        SET p_message       = 'ERROR: Order bukan milik user ini.';
        LEAVE proc_main;
    END IF;

    -- Cek apakah order sudah dibayar
    IF v_payment_status != 'paid' THEN
        SET p_balance_after = NULL;
        SET p_message       = 'ERROR: Order belum dibayar, tidak bisa refund.';
        LEAVE proc_main;
    END IF;

    START TRANSACTION;

    -- Cari wallet user (Gunakan FOR UPDATE agar saldo tidak berubah selama proses)
    SELECT wallet_id, balance
    INTO v_wallet_id, v_current_bal
    FROM wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    -- Jika wallet belum ada, buat baru
    IF v_wallet_id = 0 OR v_wallet_id IS NULL THEN
        INSERT INTO wallets (user_id, balance, created_at, updated_at)
        VALUES (p_user_id, 0, NOW(3), NOW(3));

        SET v_wallet_id   = LAST_INSERT_ID();
        SET v_current_bal  = 0;
    END IF;

    -- Hitung saldo baru
    SET p_balance_after = v_current_bal + v_total_amount;

    -- Update saldo wallet
    UPDATE wallets
    SET balance    = p_balance_after,
        updated_at = NOW(3)
    WHERE wallet_id = v_wallet_id;

    -- Catat transaksi refund
    INSERT INTO wallet_transactions (wallet_id, type, amount, balance_after, created_at)
    VALUES (v_wallet_id, 'refund', v_total_amount, p_balance_after, NOW(3));

    -- (Opsional) Update status order menjadi refunded agar tidak bisa di-refund berkali-kali
    UPDATE orders SET payment_status = 'refunded' WHERE order_id = p_order_id;

    COMMIT;

    SET p_message = 'SUCCESS: Refund berhasil.';

END$$

DELIMITER ;