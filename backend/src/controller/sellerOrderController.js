const sellerOrderService = require("../services/sellerOrderService");

const getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await sellerOrderService.getSellerOrders(req.user.id, { page, limit });

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const result = await sellerOrderService.getSellerOrderById(req.params.id, req.user.id);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const processOrder = async (req, res, next) => {
  try {
    const result = await sellerOrderService.processOrderItem(req.params.orderItemId, req.user.id);
    return res.status(200).json({ success: true, message: "Pesanan diproses", data: result });
  } catch (error) {
    next(error);
  }
};

const readyToShip = async (req, res, next) => {
  try {
    const result = await sellerOrderService.readyToShipOrderItem(req.params.orderItemId, req.user.id);
    return res.status(200).json({ success: true, message: "Pesanan siap dikirim", data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrders, getOrderById, processOrder, readyToShip };
