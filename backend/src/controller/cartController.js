const cartService = require("../services/cartService");
const { addCartItemSchema } = require("../validations/cartValidation");

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await cartService.getCart(userId);

    return res.status(200).json({
      message: "Berhasil mengambil cart",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
        message : error
    })
  }
};

const addItem = async (req, res) => {
  try {
    const { error, value } = addCartItemSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const userId = req.user.id;
    const result = await cartService.addItemToCart(userId, value);

    return res.status(201).json({
      message: "Produk berhasil ditambahkan ke cart",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
        message : error
    })
  }
};

module.exports = {
  getCart,
  addItem,
};