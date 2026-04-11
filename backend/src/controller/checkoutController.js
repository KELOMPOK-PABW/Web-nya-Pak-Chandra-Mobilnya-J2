const {checkoutSchema} = require("../validations/checkoutValidation");
const checkoutService = require("../services/checkoutService");

const checkout = async (req, res,next) => {
  try {
    const { error, value } = checkoutSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const result = await checkoutService.checkout(value);

    return res.status(201).json({
      message: "Checkout berhasil",
      data: result,
    });
  } catch (error) {
    // return res.status(500).json({
    //     error : error
    // })
    next(error)
  }
};

module.exports = {
  checkout,
};