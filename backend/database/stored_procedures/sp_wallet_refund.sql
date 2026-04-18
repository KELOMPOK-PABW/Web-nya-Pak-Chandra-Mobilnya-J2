-- ============================================================
-- STORED PROCEDURE: sp_wallet_refund
-- Refund pembayaran order ke wallet user.
-- Validasi: order harus ada, milik user, dan berstatus paid.
--
-- Parameter:
--   IN  p_user_id       INT            - ID user yang refund
--   IN  p_order_id      INT            - ID order yang di-refund
--   OUT p_balance_after DECIMAL(15,2)  - Saldo setelah refund
--   OUT p_message       VARCHAR(255)   - Pesan hasil eksekusi
--
-- Contoh:
--   CALL sp_wallet_refund(1, 5, @bal, @msg);
--   SELECT @bal AS balance_after, @msg AS pesan;
-- ============================================================

DROP PROCEDURE IF EXISTS sp_wallet_refund;

DELIMITER $$

CREATE PROCEDURE sp_wallet_refund(
    IN  p_user_id       INT,
    IN  p_order_id      INT,
    OUT p_balance_after DECIMAL(15,2),
    OUT p_message       VARCHAR(255)
)
BEGIN
    DECLARE v_order_exists    INT DEFAULT 0;
    DECLARE v_buyer_id        INT;
    DECLARE v_payment_status  VARCHAR(20);
    DECLARE v_total_amount    DECIMAL(15,2);
    DECLARE v_wallet_id       INT DEFAULT 0;
    DECLARE v_current_bal     DECIMAL(15,2) DEFAULT 0;

    -- Cek apakah order ada
    SELECT COUNT(*), buyer_id, payment_status, total_amount
    INTO v_order_exists, v_buyer_id, v_payment_status, v_total_amount
    FROM orders
    WHERE order_id = p_order_id;

    IF v_order_exists = 0 THEN
        SET p_balance_after = NULL;
        SET p_message       = 'ERROR: Order tidak ditemukan.';
        LEAVE sp_wallet_refund;
    END IF;

    -- Cek apakah order milik user
    IF v_buyer_id != p_user_id THEN
        SET p_balance_after = NULL;
        SET p_message       = 'ERROR: Order bukan milik user ini.';
        LEAVE sp_wallet_refund;
    END IF;

    -- Cek apakah order sudah dibayar
    IF v_payment_status != 'paid' THEN
        SET p_balance_after = NULL;
        SET p_message       = 'ERROR: Order belum dibayar, tidak bisa refund.';
        LEAVE sp_wallet_refund;
    END IF;

    START TRANSACTION;

    -- Cari wallet user, buat jika belum ada
    SELECT wallet_id, balance
    INTO v_wallet_id, v_current_bal
    FROM wallets
    WHERE user_id = p_user_id;

    IF v_wallet_id = 0 THEN
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

    COMMIT;

    SET p_message = 'SUCCESS: Refund berhasil.';
END$$

DELIMITER ;
