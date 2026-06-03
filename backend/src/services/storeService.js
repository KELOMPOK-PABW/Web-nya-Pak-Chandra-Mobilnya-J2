const storeRepository = require("../repository/storeRepository");

const getMyStore = async (userId) => {
  const user = await storeRepository.findByUserId(userId);
  if (!user) throw new Error("Toko tidak ditemukan");

  return {
    id: user.id,
    store_name: user.full_name,
    phone: user.phone || "",
  };
};

const updateMyStore = async (userId, data) => {
  const prisma = require("../config/database");
  const updateData = {};
  if (data.store_name !== undefined) updateData.full_name = data.store_name;
  if (data.phone !== undefined) updateData.phone = data.phone;

  const user = await prisma.user.update({
    where: { id: Number(userId) },
    data: updateData,
    select: { id: true, full_name: true, phone: true },
  });

  return {
    id: user.id,
    store_name: user.full_name,
    phone: user.phone || "",
  };
};

module.exports = {
  getMyStore,
  updateMyStore,
};
