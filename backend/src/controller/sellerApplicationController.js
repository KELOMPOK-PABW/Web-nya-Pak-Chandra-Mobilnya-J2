const sellerApplicationService = require("../services/sellerApplicationService");

const apply = async (req, res) => {
  try {
    const { store_name, phone, address, city } = req.body;
    if (!store_name) {
      return res.status(400).json({ success: false, message: "Nama toko wajib diisi" });
    }
    const result = await sellerApplicationService.apply(req.user.id, req.body);
    return res.status(201).json({ success: true, message: "Pengajuan berhasil dikirim", data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getMyApplication = async (req, res) => {
  try {
    const result = await sellerApplicationService.getMyApplication(req.user.id);
    if (!result) {
      return res.status(200).json({ success: true, data: null, message: "Belum ada pengajuan" });
    }
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const applications = await sellerApplicationService.getAllApplications();
    return res.status(200).json({ success: true, data: applications });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const approve = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sellerApplicationService.approveApplication(id);
    return res.status(200).json({ success: true, message: "Pengajuan disetujui", data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const reject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const result = await sellerApplicationService.rejectApplication(id, reason);
    return res.status(200).json({ success: true, message: "Pengajuan ditolak", data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { apply, getMyApplication, getAllApplications, approve, reject };
