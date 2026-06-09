const storeService = require("../services/storeService");

const getMyStore = async (req, res) => {
  try {
    const store = await storeService.getMyStore(req.user.id);
    return res.status(200).json({ success: true, data: store });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateMyStore = async (req, res) => {
  try {
    const result = await storeService.updateMyStore(req.user.id, req.body);
    return res.status(200).json({ success: true, message: "Toko berhasil diperbarui", data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getMyStore, updateMyStore };
