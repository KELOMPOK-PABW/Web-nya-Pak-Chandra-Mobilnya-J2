-- ============================================================
-- STORED PROCEDURE: sp_wallet_topup
-- ============================================================

DROP PROCEDURE IF EXISTS sp_wallet_topup;

DELIMITER $$

CREATE PROCEDURE sp_wallet_topup(
    IN  p_user_id       INT,
    IN  p_amount        DECIMAL(15,2),
    OUT p_balance_after DECIMAL(15,2),
    OUT p_message       VARCHAR(255)
)
-- 1. TAMBAHKAN LABEL DI SINI
proc_main: BEGIN
    DECLARE v_wallet_id     INT DEFAULT 0;
    DECLARE v_current_bal   DECIMAL(15,2) DEFAULT 0;
    DECLARE v_user_exists   INT DEFAULT 0;

    -- Handler untuk rollback otomatis jika terjadi error database
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_message = 'ERROR: Terjadi kesalahan sistem saat proses topup.';
    END;

    -- Validasi amount
    IF p_amount <= 0 THEN
        SET p_balance_after = NULL;
        SET p_message       = 'ERROR: Jumlah topup harus lebih dari 0.';
        LEAVE proc_main; -- 2. GUNAKAN LABEL UNTUK KELUAR
    END IF;

    -- Cek apakah user ada (Pastikan nama kolom ID sesuai, biasanya 'id' atau 'user_id')
    SELECT COUNT(*)
    INTO v_user_exists
    FROM users
    WHERE id = p_user_id;

    IF v_user_exists = 0 THEN
        SET p_balance_after = NULL;
        SET p_message       = 'ERROR: User tidak ditemukan.';
        LEAVE proc_main;
    END IF;

    START TRANSACTION;

    -- Cari wallet user (Gunakan FOR UPDATE untuk keamanan data saldo)
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
    SET p_balance_after = v_current_bal + p_amount;

    -- Update saldo wallet
    UPDATE wallets
    SET balance    = p_balance_after,
        updated_at = NOW(3)
    WHERE wallet_id = v_wallet_id;

    -- Catat transaksi topup
    INSERT INTO wallet_transactions (wallet_id, type, amount, balance_after, created_at)
    VALUES (v_wallet_id, 'topup', p_amount, p_balance_after, NOW(3));

    COMMIT;

    SET p_message = CONCAT('SUCCESS: Top up sebesar ', p_amount, ' berhasil.');

END$$

DELIMITER ;