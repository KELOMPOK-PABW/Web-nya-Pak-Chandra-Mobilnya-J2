
DELIMITER $$

CREATE PROCEDURE sp_clear_cart (
    IN p_user_id INT
)
BEGIN
    DECLARE v_cart_id INT;
    DECLARE v_deleted_rows INT DEFAULT 0;

    START TRANSACTION;

    -- cari cart aktif user
    SELECT cart_id
    INTO v_cart_id
    FROM carts
    WHERE user_id = p_user_id
      AND status = 'active'
    LIMIT 1
    FOR UPDATE;

    IF v_cart_id IS NULL THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cart aktif tidak ditemukan';
    END IF;

    DELETE FROM cart_items
    WHERE cart_id = v_cart_id;

    SET v_deleted_rows = ROW_COUNT();

    COMMIT;

    SELECT
        v_cart_id AS cart_id,
        v_deleted_rows AS deleted_items,
        'Cart berhasil dikosongkan' AS message;
END $$

DELIMITER ;