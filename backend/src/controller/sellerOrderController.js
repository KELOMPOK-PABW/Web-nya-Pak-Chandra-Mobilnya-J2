const sellerOrderService = require("../services/sellerOrderService");

const getSellerOrders = async (req, res) => {
  try {
    const result = await sellerOrderService.getSellerOrders(req.user.id);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getSellerOrderById = async (req, res) => {
  try {
    const result = await sellerOrderService.getSellerOrderById(req.params.id, req.user.id);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    const statusCode = error.message === "Pesanan tidak ditemukan" ? 404 : 400;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

const processOrder = async (req, res) => {
  try {
    const result = await sellerOrderService.processOrder(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Pesanan berhasil diproses",
      data: result,
    });
  } catch (error) {
    const statusCode = error.message === "Pesanan tidak ditemukan" ? 404 : 400;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

const readyToShipOrder = async (req, res) => {
  try {
    const result = await sellerOrderService.readyToShipOrder(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Pesanan siap dikirim",
      data: result,
    });
  } catch (error) {
    const statusCode = error.message === "Pesanan tidak ditemukan" ? 404 : 400;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSellerOrders,
  getSellerOrderById,
  processOrder,
  readyToShipOrder,
};
