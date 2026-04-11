CREATE PROCEDURE sp_update_cart_item (
    IN p_user_id INT,
    IN p_product_id INT,
    IN p_new_quantity INT
)
BEGIN
    DECLARE v_cart_id INT;
    DECLARE v_item_exists INT DEFAULT 0;

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

    -- cek item ada atau tidak
    SELECT COUNT(*)
    INTO v_item_exists
    FROM cart_items
    WHERE cart_id = v_cart_id
      AND product_id = p_product_id;

    IF v_item_exists = 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Item tidak ditemukan di cart';
    END IF;

    -- kalau quantity <= 0, hapus item
    IF p_new_quantity IS NULL OR p_new_quantity <= 0 THEN
        DELETE FROM cart_items
        WHERE cart_id = v_cart_id
          AND product_id = p_product_id;
    ELSE
        UPDATE cart_items
        SET quantity = p_new_quantity
        WHERE cart_id = v_cart_id
          AND product_id = p_product_id;
    END IF;

    COMMIT;

    SELECT
        v_cart_id AS cart_id,
        p_product_id AS product_id,
        p_new_quantity AS new_quantity,
        'Update cart item berhasil' AS message;
END $$

DELIMITER ;