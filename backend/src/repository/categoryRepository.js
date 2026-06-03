const prisma = require("../config/database");

const findAll = async () => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};

const findById = async (id) => {
  return prisma.category.findUnique({
    where: { id: Number(id) },
  });
};

const create = async (data) => {
  return prisma.category.create({
    data: {
      name: data.name,
      description: data.description || "",
    },
  });
};

const update = async (id, data) => {
  return prisma.category.update({
    where: { id: Number(id) },
    data,
  });
};

const findByName = async (name) => {
  return prisma.category.findFirst({
    where: { name: { equals: name } },
  });
};

const deleteById = async (id) => {
  return prisma.category.delete({
    where: { id: Number(id) },
  });
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  findByName,
  deleteById,
};
