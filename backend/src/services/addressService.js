const addressRepository = require("../repository/addressRepository");
const AppError = require("../utils/AppError");

const getAll = async (userId) => {
  return addressRepository.findByUserId(userId);
};

const create = async (userId, data) => {
  const { address, city, postal_code } = data;
  return addressRepository.create({
    userId: Number(userId),
    address,
    city,
    postalCode: postal_code || "",
  });
};

const update = async (id, userId, data) => {
  const existing = await addressRepository.findById(Number(id));
  if (!existing) throw new AppError("Alamat tidak ditemukan", 404);
  if (existing.userId !== Number(userId)) throw new AppError("Akses ditolak", 403);

  const updateData = {};
  if (data.address !== undefined) updateData.address = data.address;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.postal_code !== undefined) updateData.postalCode = data.postal_code;

  return addressRepository.update(Number(id), updateData);
};

const deleteById = async (id, userId) => {
  const existing = await addressRepository.findById(Number(id));
  if (!existing) throw new AppError("Alamat tidak ditemukan", 404);
  if (existing.userId !== Number(userId)) throw new AppError("Akses ditolak", 403);

  return addressRepository.deleteById(Number(id));
};

module.exports = {
  getAll,
  create,
  update,
  deleteById,
};
