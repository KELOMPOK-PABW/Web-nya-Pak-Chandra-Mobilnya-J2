const storeRepository = require("../repository/storeRepository");
const AppError = require("../utils/AppError");

const formatStoreResponse = (store) => ({
  id: store.id,
  store_name: store.storeName,
  phone: store.phone || "",
  is_active: store.isActive,
  created_at: store.createdAt,
});

const formatUpdatedStoreResponse = (store) => ({
  id: store.id,
  store_name: store.storeName,
  phone: store.phone || "",
  updated_at: store.updatedAt,
});

const getMyStore = async (userId) => {
  const store = await storeRepository.findByUserId(userId);
  if (!store) {
    throw new AppError("Toko tidak ditemukan", 404);
  }

  return formatStoreResponse(store);
};

const updateMyStore = async (userId, data) => {
  const store = await storeRepository.findByUserId(userId);
  if (!store) {
    throw new AppError("Toko tidak ditemukan", 404);
  }

  const updateData = {};
  if (data.store_name !== undefined) updateData.storeName = data.store_name;
  if (data.phone !== undefined) updateData.phone = data.phone;

  const updated = await storeRepository.updateByUserId(userId, updateData);

  return formatUpdatedStoreResponse(updated);
};

module.exports = {
  getMyStore,
  updateMyStore,
};
