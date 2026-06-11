const prisma = require("../config/database");

const findByUserId = async (userId) => {
  return prisma.address.findMany({
    where: { userId: Number(userId) },
    orderBy: { id: "desc" },
  });
};

const findById = async (id) => {
  return prisma.address.findUnique({
    where: { id: Number(id) },
  });
};

const create = async (data) => {
  return prisma.address.create({ data });
};

const update = async (id, data) => {
  return prisma.address.update({
    where: { id: Number(id) },
    data,
  });
};

const deleteById = async (id) => {
  return prisma.address.delete({
    where: { id: Number(id) },
  });
};

module.exports = {
  findByUserId,
  findById,
  create,
  update,
  deleteById,
};
