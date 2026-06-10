const courierService = require("../services/courierService");

const getTasks = async (req, res) => {
  try {
    const tasks = await courierService.getTasks(req.user.id);
    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getTaskDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await courierService.getTaskDetail(id);
    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

const pickup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await courierService.pickup(id, req.user.id);
    return res.status(200).json({ success: true, message: "Pickup berhasil", data: result });
  } catch (error) {
    next(error);
  }
};

const deliver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await courierService.deliver(id, req.user.id);
    return res.status(200).json({ success: true, message: "Pengiriman berhasil", data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTaskDetail, pickup, deliver };
