const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    const newUser = await authService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        is_active: newUser.isActive,
        roles: [newUser.role],
        created_at: newUser.createdAt,
      },
    });
  } catch (error) {
    const isClientError = error.message === "Email sudah terdaftar";
    res.status(isClientError ? 400 : 500).json({
      success: false,
      message: isClientError ? error.message : "Gagal melakukan registrasi",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: {
        access_token: token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          roles: [user.role],
          is_active: user.isActive,
        },
      },
    });
  } catch (error) {
    const isClientError = error.message === "Email atau password salah";
    res.status(isClientError ? 401 : 500).json({
      success: false,
      message: isClientError ? error.message : "Gagal melakukan login",
      error: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await authService.getUserById(userId);

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        roles: [user.role],
        is_active: user.isActive,
        created_at: user.createdAt,
      },
    });
  } catch (error) {
    const isClientError = error.message === "User tidak ditemukan";
    res.status(isClientError ? 404 : 500).json({
      success: false,
      message: isClientError ? error.message : "Gagal mengambil data user",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
