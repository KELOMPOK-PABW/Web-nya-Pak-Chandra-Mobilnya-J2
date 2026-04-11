const cartService = require("../services/cartService");
const { addCartItemSchema, updateCartItemSchema, deleteCartItemSchema, clearCartSchema } = require("../validations/cartValidation");

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

const updateCartItem = async (req,res) => {
  try {
    const {id} = req.params
    const {user_id, qty} = req.body

    const validation = updateCartItemSchema({
      user_id : Number(user_id),
      qty : Number(qty)
    })
    if (!validation.isValid){
      return res.status(404).json({
        message : "req error",
        errors : validation.errors
      })
    }

    const result = await cartService.updateCartItem({
      userId : user_id,
      cartItemId : id,
      quantity : qty
    })

    return res.status(200).json({
      result
    })
  } catch (error) {
    res.status(400).json({
      error : error.message
    })
  }
}

const deleteCartItem = async(req,res) => {
  const {id} = req.params
  const {user_id, cartItemId} = req.body
  const validateReqDeleteCartItem = deleteCartItemSchema.validate({
    user_id : Number(user_id),
    qty : Number(qty)
  })

  if (!validation.isValid){
    return res.status(404).json({
      message : "req error",
      errors : validation.errors
    })
  }

  try {
    const result = await cartService.deleteCartItem({
      cartItemId : Number(cartItemId),
      userId : Number(user_id)
    })

    return res.status(200).json({
      result
    })
  } catch (error) {
    res.status(400).json({
      error : error.message
    })
  }
}

const clearCart = async (req, res) => {
  try {
    const { user_id } = req.body;

    const validation = validateClearCart({
      user_id: Number(user_id),
    });

    if (!validation.isValid) {
      return res.status(400).json({
        message: "Validation error",
        errors: validation.errors,
      });
    }

    const result = await cartService.clearCart({
      user_id: Number(user_id),
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};



module.exports = {
  getCart,
  addItem,
  updateCartItem,
  clearCart,
  deleteCartItem
};