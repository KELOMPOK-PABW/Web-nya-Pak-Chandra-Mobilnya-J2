const authService = require("../services/authService");

const getRoleFromUser = (user) => {
  if (user.roles && user.roles.length > 0) {
    return user.roles.map(r => r.role?.nameRole || "buyer");
  }
  return ["buyer"];
};

const register = async (req, res) => {
  try {
    const newUser = await authService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: {
        id: newUser.id,
        full_name: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        is_active: newUser.isActive,
        roles: getRoleFromUser(newUser),
        created_at: newUser.createdAt,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: statusCode < 500 ? error.message : "Gagal melakukan registrasi",
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
          full_name: user.fullName,
          email: user.email,
          roles: getRoleFromUser(user),
          is_active: user.isActive,
        },
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: statusCode < 500 ? error.message : "Gagal melakukan login",
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
        full_name: user.fullName,
        email: user.email,
        phone: user.phone,
        roles: getRoleFromUser(user),
        is_active: user.isActive,
        created_at: user.createdAt,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: statusCode < 500 ? error.message : "Gagal mengambil data user",
      error: error.message,
    });
  }
};

const updateMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await authService.updateUserProfile(userId, req.body);

    res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: {
        id: user.id,
        full_name: user.fullName,
        email: user.email,
        phone: user.phone,
        roles: getRoleFromUser(user),
        is_active: user.isActive,
        created_at: user.createdAt,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: statusCode < 500 ? error.message : "Gagal memperbarui profil",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
};
