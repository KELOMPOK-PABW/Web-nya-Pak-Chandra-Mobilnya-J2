const adminService = require("../services/adminService");

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { search, role, status } = req.query;

    const result = await adminService.getUsers({ page, limit, search, role, status });
    return res.status(200).json({ success: true, data: result.users, meta: result.meta });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getUserDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await adminService.getUserDetail(id);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.banUser(id);
    return res.status(200).json({ success: true, message: "User berhasil di-ban", data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const unbanUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.unbanUser(id);
    return res.status(200).json({ success: true, message: "User berhasil diaktifkan", data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, message: "Role wajib diisi" });
    }
    const result = await adminService.changeUserRole(id, role);
    return res.status(200).json({ success: true, message: "Role user berhasil diubah", data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, getUserDetail, banUser, unbanUser, changeUserRole };
