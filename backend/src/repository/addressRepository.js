const prisma = require("../config/database");

const createAddress = async (data) => {
  return await prisma.address.create({
    data,
  });
};

const findAddressesByUserId = async (userId) => {
  return await prisma.address.findMany({
    where: { userId },
  });
};

const findAddressById = async (id) => {
  return await prisma.address.findUnique({
    where: { id },
  });
};

const updateAddress = async (id, data) => {
  return await prisma.address.update({
    where: { id },
    data,
  });
};

const deleteAddress = async (id) => {
  return await prisma.address.delete({
    where: { id },
  });
};

module.exports = {
  createAddress,
  findAddressesByUserId,
  findAddressById,
  updateAddress,
  deleteAddress,
};
