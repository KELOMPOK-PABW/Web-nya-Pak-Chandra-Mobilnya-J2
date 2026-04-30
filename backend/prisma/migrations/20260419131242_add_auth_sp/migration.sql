DROP PROCEDURE IF EXISTS sp_register;
CREATE PROCEDURE sp_register(
    IN p_full_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_role_id INT
)
BEGIN
    DECLARE new_user_id BIGINT UNSIGNED;

    -- Insert ke tabel users
    INSERT INTO users (role_id, full_name, email, password_hash)
    VALUES (p_role_id, p_full_name, p_email, p_password_hash);

    -- Ambil ID user yang baru dibuat
    SET new_user_id = LAST_INSERT_ID();

    -- Otomatis buatkan wallet untuk user baru
    INSERT INTO ewallet (user_id, balance)
    VALUES (new_user_id, 0.00);
END;

DROP PROCEDURE IF EXISTS sp_login;
CREATE PROCEDURE sp_login(
    IN p_email VARCHAR(255)
)
BEGIN
    SELECT u.id, u.full_name, u.email, u.password_hash, r.nama_role, u.is_active
    FROM users u
    JOIN role r ON u.role_id = r.id
    WHERE u.email = p_email AND u.is_active = 1;
END;
