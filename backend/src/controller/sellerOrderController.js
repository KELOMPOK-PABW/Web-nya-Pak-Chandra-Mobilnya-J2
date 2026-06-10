const sellerOrderService = require("../services/sellerOrderService");

const getOrders = async (req, res) => {
  try {
    const orders = await sellerOrderService.getSellerOrders(req.user.id);
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const processOrder = async (req, res, next) => {
  try {
    const { orderItemId } = req.params;
    const result = await sellerOrderService.processOrderItem(orderItemId, req.user.id);
    return res.status(200).json({ success: true, message: "Pesanan diproses", data: result });
  } catch (error) {
    next(error);
  }
};

const readyToShip = async (req, res, next) => {
  try {
    const { orderItemId } = req.params;
    const result = await sellerOrderService.readyToShipOrderItem(orderItemId, req.user.id);
    return res.status(200).json({ success: true, message: "Pesanan siap dikirim", data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrders, processOrder, readyToShip };
