CREATE PROCEDURE sp_insert_product(
    IN p_product_name VARCHAR(255),
    IN p_description TEXT,
    IN p_price DECIMAL(15,2),
    IN p_stock INT,
    IN p_stock_status VARCHAR(50),
    IN p_seller_id INT,
    IN p_image_url VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_product_name IS NULL OR TRIM(p_product_name) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Nama produk wajib diisi';
    END IF;

    IF p_price IS NULL OR p_price < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Harga produk tidak valid';
    END IF;

    IF p_stock IS NULL OR p_stock < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stok produk tidak valid';
    END IF;

    START TRANSACTION;

    INSERT INTO products (
        name,
        description,
        price,
        stock,
        stock_status,
        seller_id,
        image_url,
        created_at
    ) VALUES (
        p_product_name,
        p_description,
        p_price,
        p_stock,
        p_stock_status,
        p_seller_id,
        p_image_url,
        NOW()
    );

    COMMIT;

    SELECT LAST_INSERT_ID() AS id, 'Product Berhasil ditambahkan' AS message;
END;

CREATE PROCEDURE sp_update_stock(
IN p_product_id INT,
IN p_stock_change INT
)
BEGIN
    DECLARE v_current_stock INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_product_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Product ID wajib diisi';
    END IF;

    IF p_stock_change IS NULL OR p_stock_change = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Perubahan stock tidak valid';
    END IF;

    START TRANSACTION;

    SELECT stock
    INTO v_current_stock
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;

    IF v_current_stock IS NULL THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Produk tidak ditemukan';
    END IF;

    IF v_current_stock + p_stock_change < 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock tidak mencukupi';
    END IF;

    UPDATE products
    SET stock = stock + p_stock_change,
        stock_status = CASE 
            WHEN stock + p_stock_change <= 0 THEN 'habis'   
            ELSE 'tersedia'                                 
        END
    WHERE id = p_product_id;

    COMMIT;

    SELECT p_product_id AS id, stock AS updated_stock
    FROM products
    WHERE id = p_product_id;
END;