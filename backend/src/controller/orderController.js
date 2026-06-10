const orderService = require("../services/orderService");

const getAllOrders = async (req, res) => {
  try {
    const result = await orderService.getAllOrders(req.user.id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await orderService.getOrderById(Number(id), req.user.id);

    return res.status(200).json({
      success: true,
      message: "Detail order",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderItems = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await orderService.getOrderItems(Number(id), req.user.id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrderItems,
};
