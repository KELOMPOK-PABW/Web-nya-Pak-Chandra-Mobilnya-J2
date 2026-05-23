-- ============================================================
-- 1. FIX SP REGISTER
-- ============================================================
DROP PROCEDURE IF EXISTS sp_register;

DELIMITER $$

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
    -- Pastikan nama tabel benar: 'ewallet' atau 'wallets'? (Sesuaikan)
    INSERT INTO ewallet (user_id, balance)
    VALUES (new_user_id, 0.00);

-- PERBAIKAN: Gunakan $$ sebagai penutup karena DELIMITER sudah diganti ke $$
END$$

DELIMITER ;


-- ============================================================
-- 2. FIX SP LOGIN
-- ============================================================
DROP PROCEDURE IF EXISTS sp_login;

DELIMITER $$

CREATE PROCEDURE sp_login(
    IN p_email VARCHAR(255)
)
BEGIN
    SELECT u.id, u.full_name, u.email, u.password_hash, r.nama_role, u.is_active
    FROM users u
    -- Pastikan nama tabel 'role' atau 'roles' dan kolom 'nama_role' sesuai di DB kamu
    JOIN role r ON u.role_id = r.id
    WHERE u.email = p_email AND u.is_active = 1;

-- PERBAIKAN: Gunakan $$ sebagai penutup (kamu sebelumnya pakai //)
END$$

DELIMITER ;