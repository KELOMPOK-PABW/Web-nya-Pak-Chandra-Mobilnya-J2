const adminRepository = require("../repository/adminRepository");

const getUsers = async ({ page = 1, limit = 20, search, role, status }) => {
  const skip = (page - 1) * limit;
  const take = limit;

  const statusFilter = status !== undefined ? status : undefined;

  const [users, totalItems] = await Promise.all([
    adminRepository.findAllUsers({ skip, take, search, role, status: statusFilter }),
    adminRepository.countAllUsers({ search, role, status: statusFilter }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    users: users.map((u) => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      is_active: u.isActive,
      created_at: u.createdAt,
    })),
    meta: { page, limit, total_items: totalItems, total_pages: totalPages },
  };
};

const banUser = async (userId) => {
  const user = await adminRepository.findUserById(userId);
  if (!user) throw new Error("User tidak ditemukan");
  if (!user.isActive) throw new Error("User sudah di-ban");

  await adminRepository.updateUser(userId, { isActive: false });
  return { id: user.id, status: "banned" };
};

const unbanUser = async (userId) => {
  const user = await adminRepository.findUserById(userId);
  if (!user) throw new Error("User tidak ditemukan");
  if (user.isActive) throw new Error("User sudah aktif");

  await adminRepository.updateUser(userId, { isActive: true });
  return { id: user.id, status: "active" };
};

const changeUserRole = async (userId, role) => {
  const validRoles = ["buyer", "seller", "kurir"];
  if (!validRoles.includes(role)) throw new Error("Role tidak valid");

  const user = await adminRepository.findUserById(userId);
  if (!user) throw new Error("User tidak ditemukan");

  await adminRepository.updateUser(userId, { role });
  return { id: user.id, role };
};

const getUserDetail = async (userId) => {
  const user = await adminRepository.findUserById(userId);
  if (!user) throw new Error("User tidak ditemukan");

  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    is_active: user.isActive,
    created_at: user.createdAt,
  };
};

module.exports = {
  getUsers,
  banUser,
  unbanUser,
  changeUserRole,
  getUserDetail,
};
