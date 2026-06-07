const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authRepository = require("../repository/authRepository");
const env = require("../config/env");

const registerUser = async (userData) => {
  const { full_name, email, password, phone, role } = userData;

  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) {
    throw new Error("Email sudah terdaftar");
  }

  const hashedPassword = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  const newUser = await authRepository.createUser({
    full_name,
    email,
    passwordHash: hashedPassword,
    phone: phone || null,
    isActive: true,
  });

  return newUser;
};

const loginUser = async (email, password) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw new Error("Email atau password salah");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Email atau password salah");
  }

  // Get role from user_roles relation
  const userRole = user.roles?.[0]?.role?.nameRole || "buyer";

  const token = jwt.sign(
    { id: user.id, email: user.email, role: userRole },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return { token, user };
};

const getUserById = async (id) => {
  const user = await authRepository.findUserById(id);
  if (!user) {
    throw new Error("User tidak ditemukan");
  }
  return user;
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
};
