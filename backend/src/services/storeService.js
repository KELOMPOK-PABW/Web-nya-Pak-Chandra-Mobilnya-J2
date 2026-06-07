const storeRepository = require("../repository/storeRepository");

const getMyStore = async (userId) => {
  const store = await storeRepository.findByUserId(userId);
  if (!store) throw new Error("Toko tidak ditemukan");

  return {
    id: store.id,
    store_name: store.storeName,
    phone: store.phone || "",
  };
};

const updateMyStore = async (userId, data) => {
  const updateData = {};
  if (data.store_name !== undefined) updateData.storeName = data.store_name;
  if (data.phone !== undefined) updateData.phone = data.phone;

  const store = await storeRepository.updateByUserId(userId, updateData);

  return {
    id: store.id,
    store_name: store.storeName,
    phone: store.phone || "",
  };
};

module.exports = {
  getMyStore,
  updateMyStore,
};
