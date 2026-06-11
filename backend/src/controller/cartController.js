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
        message : error.message
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
        message : error.message
    })
  }
};

const updateCartItem = async (req,res) => {
  try {
    const {id} = req.params
    const userId = req.user.id;
    const {qty} = req.body

    const { error } = updateCartItemSchema.validate({
      qty : Number(qty)
    })
    if (error){
      return res.status(400).json({
        message : "Validation error",
        errors : error.details[0].message
      })
    }

    const result = await cartService.updateCartItem({
      userId : userId,
      cartItemId : Number(id),
      quantity : Number(qty)
    })

    return res.status(200).json({
      message: "Cart item berhasil diupdate",
      data: result
    })
  } catch (error) {
    res.status(400).json({
      message : error.message
    })
  }
}

const deleteCartItem = async(req,res) => {
  try {
    const {id} = req.params
    const userId = req.user.id;

    const result = await cartService.deleteCartItem({
      cartItemId : Number(id),
      userId : userId
    })

    return res.status(200).json({
      message: "Item berhasil dihapus dari cart",
      data: result
    })
  } catch (error) {
    res.status(400).json({
      message : error.message
    })
  }
}

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = clearCartSchema.validate({
      user_id: userId,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details[0].message,
      });
    }

    const result = await cartService.clearCart({
      user_id: userId,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const validateCart = async(req,res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Token tidak valid.",
        data: null,
      });
    }
    const userId = req.user.id;
    const results = await cartService.validateCart({ userId })
    return res.status(results.statusCode).json({
      message : results.message,
      success : results.success,
      data : results.data
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      data: null
  })
  }
}

const countCartItems = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Token tidak valid.",
        data: null,
      });
    }
    const userId = req.user.id;
    const result = await cartService.countCartItems({ userId });

    return res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      data: null,
    });
  }
};

module.exports = {
  getCart,
  addItem,
  updateCartItem,
  clearCart,
  deleteCartItem,
  validateCart,
  countCartItems
}