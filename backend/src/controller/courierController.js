const courierService = require("../services/courierService");
const { assignCourierSchema } = require("../validations/courierValidation");

const assign = async (req, res, next) => {
  const { error, value } = assignCourierSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  try {
    const data = await courierService.assignCourier({
      orderItemId: value.order_item_id,
      kurirId: value.kurir_id,
      requesterRole: req.user.role,
    });
    return res.status(201).json({
      success: true,
      message: "Kurir berhasil ditugaskan",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getAssignment = async (req, res, next) => {
  try {
    const data = await courierService.getAssignmentDetail(req.params.id, req.user.role);
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getCourierTask = async (req, res, next) => {
  try {
    const data = await courierService.getCourierTasks(req.user.id);
    return res.status(200).json({
      message: "Daftar tugas kurir",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const tasks = await courierService.getTasks(req.user.id);
    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

const getTaskDetail = async (req, res, next) => {
  try {
    const task = await courierService.getTaskDetail(req.params.id);
    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

const pickup = async (req, res, next) => {
  try {
    const result = await courierService.pickup(req.params.id, req.user.id);
    return res.status(200).json({ success: true, message: "Pickup berhasil", data: result });
  } catch (error) {
    next(error);
  }
};

const deliver = async (req, res, next) => {
  try {
    const result = await courierService.deliver(req.params.id, req.user.id);
    return res.status(200).json({ success: true, message: "Pengiriman berhasil", data: result });
  } catch (error) {
    next(error);
  }
};

const returnToSeller = async (req, res, next) => {
  try {
    const result = await courierService.returnToSeller(req.params.id, req.user.id);
    return res.status(200).json({ success: true, message: "Return berhasil", data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  assign,
  getAssignment,
  getCourierTask,
  getTasks,
  getTaskDetail,
  pickup,
  deliver,
  returnToSeller,
};
