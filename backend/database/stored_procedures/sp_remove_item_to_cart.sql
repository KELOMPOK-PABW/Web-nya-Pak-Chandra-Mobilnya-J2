-- sp cart(remove item)

CREATE PROCEDURE sp_remove_item_from_cart (
    IN p_user_id INT,
    IN p_product_id INT,
    IN p_quantity INT
)
BEGIN
    DECLARE v_cart_id INT;
    DECLARE v_current_qty INT;

    IF p_quantity IS NULL OR p_quantity <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Quantity harus lebih dari 0';
    END IF;

    START TRANSACTION;

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

    -- cek item di cart
    SELECT quantity
    INTO v_current_qty
    FROM cart_items
    WHERE cart_id = v_cart_id
      AND product_id = p_product_id
    LIMIT 1
    FOR UPDATE;

    IF v_current_qty IS NULL THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Item tidak ditemukan di cart';
    END IF;

    -- jika quantity setelah dikurangi <= 0, hapus item
    IF v_current_qty - p_quantity <= 0 THEN
        DELETE FROM cart_items
        WHERE cart_id = v_cart_id
          AND product_id = p_product_id;
    ELSE
        UPDATE cart_items
        SET quantity = quantity - p_quantity
        WHERE cart_id = v_cart_id
          AND product_id = p_product_id;
    END IF;

    COMMIT;

    SELECT 
        v_cart_id AS cart_id,
        p_product_id AS product_id,
        'Remove item from cart berhasil' AS message;
END $$

DELIMITER ;
