const prisma = require("../config/database");

const findAllUsers = async ({ skip, take, search, role, status }) => {
  const where = {};
  if (search) {
    where.OR = [
      { full_name: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (role) where.role = role;
  if (status !== undefined) where.isActive = status === "active";

  return prisma.user.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });
};

const countAllUsers = async ({ search, role, status }) => {
  const where = {};
  if (search) {
    where.OR = [
      { full_name: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (role) where.role = role;
  if (status !== undefined) where.isActive = status === "active";

  return prisma.user.count({ where });
};

const findUserById = async (id) => {
  return prisma.user.findUnique({ where: { id: Number(id) } });
};

const updateUser = async (id, data) => {
  return prisma.user.update({
    where: { id: Number(id) },
    data,
  });
};

module.exports = {
  findAllUsers,
  countAllUsers,
  findUserById,
  updateUser,
};
