const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authRepository = require("../repository/authRepository");
const AppError = require("../utils/AppError");
const prisma = require("../config/database");
const env = require("../config/env");

const registerUser = async (userData) => {
  const { full_name, email, password, phone, role } = userData;

  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) {
    throw new AppError("Email sudah terdaftar", 409);
  }

  const hashedPassword = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  const newUser = await authRepository.createUser({
    full_name,
    email,
    passwordHash: hashedPassword,
    phone: phone || null,
    isActive: true,
  });

  // Assign the selected role via user_roles junction table
  const roleRecord = await prisma.role.findFirst({
    where: { nameRole: role || "buyer" },
  });
  if (roleRecord) {
    await prisma.userRole.create({
      data: { userId: newUser.id, roleId: roleRecord.id },
    });
  }

  // Re-fetch user with roles populated for the response
  const userWithRoles = await authRepository.findUserById(newUser.id);
  return userWithRoles;
};

const loginUser = async (email, password) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw new AppError("Email atau password salah", 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Email atau password salah", 401);
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
    throw new AppError("User tidak ditemukan", 404);
  }
  return user;
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
};
