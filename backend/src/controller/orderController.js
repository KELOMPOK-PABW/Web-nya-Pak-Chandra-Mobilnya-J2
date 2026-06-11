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

const getOrderHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await orderService.getOrderHistory(Number(id), req.user.id);

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

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await orderService.cancelOrder(Number(id), req.user.id);

    return res.status(200).json({
      success: true,
      message: "Pesanan berhasil dibatalkan",
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

const confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await orderService.confirmOrder(Number(id), req.user.id);

    return res.status(200).json({
      success: true,
      message: "Pesanan berhasil dikonfirmasi diterima",
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
  getOrderHistory,
  cancelOrder,
  confirmOrder,
};
