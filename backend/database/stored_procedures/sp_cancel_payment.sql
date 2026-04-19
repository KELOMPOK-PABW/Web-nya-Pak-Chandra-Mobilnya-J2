

DROP PROCEDURE IF EXISTS sp_cancel_payment;

DELIMITER $$

CREATE PROCEDURE sp_cancel_payment(
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
        LEAVE sp_cancel_payment;
    END IF;

    IF v_current_status != 'pending' THEN
        SET p_message = CONCAT('ERROR: Hanya payment berstatus pending yang bisa dibatalkan. Status saat ini: ', v_current_status);
        LEAVE sp_cancel_payment;
    END IF;

    START TRANSACTION;

    -- Update status payment menjadi failed
    UPDATE payments
    SET status = 'failed'
    WHERE payment_id = p_payment_id;

    -- Update status pembayaran pada order
    UPDATE orders
    SET payment_status = 'failed'
    WHERE order_id = v_order_id;

    COMMIT;

    SET p_message = 'SUCCESS: Payment berhasil dibatalkan.';
END$$

DELIMITER ;
