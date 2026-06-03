const prisma = require("../config/database");

const findByUserId = async (userId) => {
  return prisma.user.findUnique({
    where: { id: Number(userId) },
    select: {
      id: true,
      full_name: true,
      phone: true,
    },
  });
};

module.exports = {
  findByUserId,
};
