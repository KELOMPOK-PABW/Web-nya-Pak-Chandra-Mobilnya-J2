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
  console.log("wow")
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await orderService.getOrderById(Number(id), req.user.id);

    return res.status(200).json({
      success: true,
      message: "Detail order",
      data: result,
    });
  } catch (error) {
    const statusCode = error.message === "Order tidak ditemukan" ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrderItems = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await orderService.getOrderItems(Number(id), req.user.id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode = error.message === "Order tidak ditemukan" ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrderItems,
};
