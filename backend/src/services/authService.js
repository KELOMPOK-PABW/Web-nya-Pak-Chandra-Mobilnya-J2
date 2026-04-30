const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authRepository = require("../repository/authRepository");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const registerUser = async (userData) => {
  const { full_name, email, password, phone, role } = userData;

  // Check if user already exists
  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) {
    throw new Error("Email sudah terdaftar");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const newUser = await authRepository.createUser({
    full_name,
    email,
    password: hashedPassword,
    phone: phone || null,
    role: role || "buyer",
    isActive: true,
  });

  return newUser;
};

const loginUser = async (email, password) => {
  // Find user
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw new Error("Email atau password salah");
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Email atau password salah");
  }

  // Generate token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "1d" }
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
