const { topupSchema, refundSchema } = require("../validations/walletValidation");
const walletService = require("../services/walletService");

const getBalance = async (req, res, next) => {
  try {
    const result = await walletService.getBalance(req.user.id);

    return res.status(200).json({
      message: "Berhasil mengambil wallet",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const result = await walletService.getTransactions(req.user.id);

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const topup = async (req, res, next) => {
  try {
    const { error, value } = topupSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const result = await walletService.topup(req.user.id, value.amount);

    return res.status(200).json({
      message: "Top up berhasil",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const refund = async (req, res, next) => {
  try {
    const { error, value } = refundSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const result = await walletService.refund(req.user.id, value.order_id);

    return res.status(200).json({
      message: "Refund berhasil",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBalance,
  getTransactions,
  topup,
  refund,
};
