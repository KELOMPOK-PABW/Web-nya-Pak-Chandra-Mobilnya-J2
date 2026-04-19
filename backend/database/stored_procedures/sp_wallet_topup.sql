-- ============================================================
-- STORED PROCEDURE: sp_wallet_topup
-- Menambah saldo wallet user. Jika wallet belum ada, buat baru.
-- Mencatat transaksi topup ke wallet_transactions.
--
-- Parameter:
--   IN  p_user_id       INT            - ID user yang topup
--   IN  p_amount        DECIMAL(15,2)  - Jumlah topup
--   OUT p_balance_after DECIMAL(15,2)  - Saldo setelah topup
--   OUT p_message       VARCHAR(255)   - Pesan hasil eksekusi
--
-- Contoh:
--   CALL sp_wallet_topup(1, 200000, @bal, @msg);
--   SELECT @bal AS balance_after, @msg AS pesan;
-- ============================================================

DROP PROCEDURE IF EXISTS sp_wallet_topup;

DELIMITER $$

CREATE PROCEDURE sp_wallet_topup(
    IN  p_user_id       INT,
    IN  p_amount        DECIMAL(15,2),
    OUT p_balance_after DECIMAL(15,2),
    OUT p_message       VARCHAR(255)
)
BEGIN
    DECLARE v_wallet_id     INT DEFAULT 0;
    DECLARE v_current_bal   DECIMAL(15,2) DEFAULT 0;
    DECLARE v_user_exists   INT DEFAULT 0;

    -- Validasi amount
    IF p_amount <= 0 THEN
        SET p_balance_after = NULL;
        SET p_message       = 'ERROR: Jumlah topup harus lebih dari 0.';
        LEAVE sp_wallet_topup;
    END IF;

    -- Cek apakah user ada
    SELECT COUNT(*)
    INTO v_user_exists
    FROM users
    WHERE id = p_user_id;

    IF v_user_exists = 0 THEN
        SET p_balance_after = NULL;
        SET p_message       = 'ERROR: User tidak ditemukan.';
        LEAVE sp_wallet_topup;
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

    SET p_message = 'SUCCESS: Top up berhasil.';
END$$

DELIMITER ;
