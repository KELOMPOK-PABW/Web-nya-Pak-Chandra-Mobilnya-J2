const prisma = require("../config/database");

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
};

const createUser = async (userData) => {
  return await prisma.user.create({
    data: {
      fullName: userData.full_name || userData.fullName,
      email: userData.email,
      passwordHash: userData.passwordHash || userData.password,
      phone: userData.phone,
      isActive: userData.isActive ?? true,
    },
  });
};

const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
};

const updateUserById = async (id, userData) => {
  return await prisma.user.update({
    where: { id },
    data: {
      fullName: userData.full_name,
      phone: userData.phone,
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
};

module.exports = {
  findUserByEmail,
  createUser,
  findUserById,
  updateUserById,
};
