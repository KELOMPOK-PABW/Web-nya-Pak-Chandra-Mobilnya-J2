const prisma = require("../config/database");

const findByUserId = async (userId) => {
  return prisma.store.findUnique({
    where: { userId: Number(userId) },
  });
};

const updateByUserId = async (userId, data) => {
  return prisma.store.update({
    where: { userId: Number(userId) },
    data,
  });
};

module.exports = {
  findByUserId,
  updateByUserId,
};
