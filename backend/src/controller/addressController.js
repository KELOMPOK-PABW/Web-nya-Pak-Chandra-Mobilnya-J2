const addressService = require("../services/addressService");
const { addressSchema } = require("../validations/addressValidation");

const createAddress = async (req, res) => {
  try {
    const { error, value } = addressSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const userId = req.user.id; // From auth middleware
    const result = await addressService.createAddress(userId, value);

    return res.status(201).json({
      message: "Alamat berhasil ditambahkan",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal menambahkan alamat",
      error: error.message,
    });
  }
};

const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await addressService.getAddresses(userId);

    return res.status(200).json({
      message: "Daftar alamat berhasil diambil",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil daftar alamat",
      error: error.message,
    });
  }
};

const getAddressById = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = parseInt(req.params.id, 10);
    const result = await addressService.getAddressById(userId, addressId);

    return res.status(200).json({
      message: "Detail alamat berhasil diambil",
      data: result,
    });
  } catch (error) {
    const isClientError = error.message === "Alamat tidak ditemukan" || error.message === "Akses ditolak";
    return res.status(isClientError ? 404 : 500).json({
      message: isClientError ? error.message : "Gagal mengambil detail alamat",
      error: error.message,
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { error, value } = addressSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const userId = req.user.id;
    const addressId = parseInt(req.params.id, 10);
    const result = await addressService.updateAddress(userId, addressId, value);

    return res.status(200).json({
      message: "Alamat berhasil diperbarui",
      data: result,
    });
  } catch (error) {
    const isClientError = error.message === "Alamat tidak ditemukan" || error.message === "Akses ditolak";
    return res.status(isClientError ? 404 : 500).json({
      message: isClientError ? error.message : "Gagal memperbarui alamat",
      error: error.message,
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = parseInt(req.params.id, 10);
    
    await addressService.deleteAddress(userId, addressId);

    return res.status(200).json({
      message: "Alamat berhasil dihapus",
    });
  } catch (error) {
    const isClientError = error.message === "Alamat tidak ditemukan" || error.message === "Akses ditolak";
    return res.status(isClientError ? 404 : 500).json({
      message: isClientError ? error.message : "Gagal menghapus alamat",
      error: error.message,
    });
  }
};

module.exports = {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
};
