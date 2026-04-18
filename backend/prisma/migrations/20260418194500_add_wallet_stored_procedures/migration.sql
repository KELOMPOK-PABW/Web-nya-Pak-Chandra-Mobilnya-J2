-- Migration: add_wallet_stored_procedures
-- Mendaftarkan stored procedure wallet ke database.

-- ============================================================
-- SP: sp_wallet_topup
-- ============================================================
DROP PROCEDURE IF EXISTS sp_wallet_topup;

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

    IF p_amount <= 0 THEN
        SET p_balance_after = NULL;
        SET p_message       = 'ERROR: Jumlah topup harus lebih dari 0.';
    ELSE
        SELECT COUNT(*)
        INTO v_user_exists
        FROM users
        WHERE id = p_user_id;

        IF v_user_exists = 0 THEN
            SET p_balance_after = NULL;
            SET p_message       = 'ERROR: User tidak ditemukan.';
        ELSE
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

            SET p_balance_after = v_current_bal + p_amount;

            UPDATE wallets
            SET balance    = p_balance_after,
                updated_at = NOW(3)
            WHERE wallet_id = v_wallet_id;

            INSERT INTO wallet_transactions (wallet_id, type, amount, balance_after, created_at)
            VALUES (v_wallet_id, 'topup', p_amount, p_balance_after, NOW(3));

            SET p_message = 'SUCCESS: Top up berhasil.';
        END IF;
    END IF;
END;

-- ============================================================
-- SP: sp_wallet_refund
-- ============================================================
DROP PROCEDURE IF EXISTS sp_wallet_refund;

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

    SELECT COUNT(*), buyer_id, payment_status, total_amount
    INTO v_order_exists, v_buyer_id, v_payment_status, v_total_amount
    FROM orders
    WHERE order_id = p_order_id;

    IF v_order_exists = 0 THEN
        SET p_balance_after = NULL;
        SET p_message       = 'ERROR: Order tidak ditemukan.';
    ELSEIF v_buyer_id != p_user_id THEN
        SET p_balance_after = NULL;
        SET p_message       = 'ERROR: Order bukan milik user ini.';
    ELSEIF v_payment_status != 'paid' THEN
        SET p_balance_after = NULL;
        SET p_message       = 'ERROR: Order belum dibayar, tidak bisa refund.';
    ELSE
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

        SET p_balance_after = v_current_bal + v_total_amount;

        UPDATE wallets
        SET balance    = p_balance_after,
            updated_at = NOW(3)
        WHERE wallet_id = v_wallet_id;

        INSERT INTO wallet_transactions (wallet_id, type, amount, balance_after, created_at)
        VALUES (v_wallet_id, 'refund', v_total_amount, p_balance_after, NOW(3));

        SET p_message = 'SUCCESS: Refund berhasil.';
    END IF;
END;
