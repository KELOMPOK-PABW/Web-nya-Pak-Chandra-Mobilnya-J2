const addressService = require("../services/addressService");

const getAll = async (req, res) => {
  try {
    const addresses = await addressService.getAll(req.user.id);
    return res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const { address, city, postal_code } = req.body;
    if (!address || !city) {
      return res.status(400).json({ success: false, message: "Alamat dan kota wajib diisi" });
    }
    const result = await addressService.create(req.user.id, req.body);
    return res.status(201).json({ success: true, message: "Alamat berhasil ditambahkan", data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await addressService.update(id, req.user.id, req.body);
    return res.status(200).json({ success: true, message: "Alamat berhasil diperbarui", data: result });
  } catch (error) {
    const statusCode = error.message === "Alamat tidak ditemukan" ? 404 : 400;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

const deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    await addressService.deleteById(id, req.user.id);
    return res.status(200).json({ success: true, message: "Alamat berhasil dihapus" });
  } catch (error) {
    const statusCode = error.message === "Alamat tidak ditemukan" ? 404 : 400;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

module.exports = { getAll, create, update, deleteById };
