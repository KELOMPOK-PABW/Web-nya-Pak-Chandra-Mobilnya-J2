const { createPaymentSchema } = require("../validations/paymentValidation");
const paymentService = require("../services/paymentService");

const createPayment = async (req, res, next) => {
  try {
    const { error, value } = createPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const result = await paymentService.createPayment(value);

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const pay = async (req, res, next) => {
  try {
    const paymentId = parseInt(req.params.id, 10);
    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      return res.status(400).json({ message: "payment id tidak valid" });
    }

    const result = await paymentService.payPayment(paymentId);

    return res.status(200).json({
      message: "Pembayaran berhasil",
      data: result,
    });
  } catch (err) {
    if (err.code === "INSUFFICIENT_BALANCE") {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

const getByOrderId = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.order_id, 10);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({ message: "order id tidak valid" });
    }

    const result = await paymentService.getPaymentByOrderId(orderId);

    return res.status(200).json({
      message: "Detail pembayaran",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPayment,
  pay,
  getByOrderId,
};
