const { number } = require("joi");
const { user } = require("../config/database");
const cartRepository = require("../repository/cartRepository");

const formatCartResponse = (cart) => {
  const items = (cart.items || []).map((item) => ({
    id: item.id,
    product_id: item.productId,
    name: item.product.name,
    price: item.product.price,
    stock: item.product.stock,
    qty: item.quantity,
    subtotal: item.product.price * item.quantity,
  }));

  const total_price = items.reduce((acc, item) => acc + item.subtotal, 0);

  return {
    cart_id: cart.id,
    status: cart.status,
    items,
    total_price,
  };
};

const getCart = async (userId) => {
  let cart = await cartRepository.findActiveCartByUserId(userId);

  if (!cart) {
    const newCart = await cartRepository.createCart(userId);
    cart = await cartRepository.getCartDetailByCartId(newCart.id);
  }

  return formatCartResponse(cart);
};

const addItemToCart = async (userId, payload) => {
  const { product_id, qty } = payload;

  const product = await cartRepository.findProductById(product_id);
  if (!product) {
    throw new Error("Produk tidak ditemukan");
  }

  if (product.stock <= 0) {
    throw new Error("Stok produk habis");
  }

  let cart = await cartRepository.findActiveCartByUserId(userId);

  if (!cart) {
    cart = await cartRepository.createCart(userId);
  }

  if (cart.status === "checked_out") {
    throw new Error("Cart sudah checkout dan tidak bisa diubah");
  }

  const existingItem = await cartRepository.findCartItemByCartIdAndProductId(
    cart.id,
    product_id
  );

  let finalQty = qty;

  if (existingItem) {
    finalQty = existingItem.quantity + qty;

    if (finalQty > product.stock) {
      throw new Error("Qty melebihi stock produk");
    }

    await cartRepository.updateCartItemQuantity(existingItem.id, finalQty);
  } else {
    if (qty > product.stock) {
      throw new Error("Qty melebihi stock produk");
    }

    await cartRepository.createCartItem({
      cartId: cart.id,
      productId: product_id,
      quantity: qty,
    });
  }

  return {
    product_id,
    qty: finalQty,
  };
};

const updateCartItem = async({cartItemId, quantity, userId}) => {
  const cartItem = await cartRepository.findCartItemByIdAndUser(cartItemId,userId)
  if (!cartItem) {
    throw new Error("Item cart tidak ditemukan");
  }

  const productPrice = Number(cartItem.product.price);

  if (qty > cartItem.product.stock) {
    throw new Error("qty melebihi stock");
  }

  const updateItem = await cartRepository.updateCartItemQuantity(cartItemId,quantity)
  return {
    message : "jumblah produk diperbarui",
    id : updateItem.id,
    qty : updateItem.quantity,
    subtotal : number(updateItem.quantity) * number(updateItem.product)
  }
}

const deleteCartItem = async({cartItemId, userId}) => {
  const findCartItem = await cartRepository.findCartItemByIdAndUser(cartItemId,userId)

  if (!findCartItem){
    throw new Error("item cart tidak ditemukan")
  }

  await cartRepository.deleteCartItemById(userId)
  
  return {
    message : "product dihapus dari cart"
  }
}

const clearCart = async ({ user_id }) => {
  await cartRepository.clearCartItemsByUserId(user_id);

  return {
    message: "Cart dikosongkan",
  };
};

const getUserIdFromRequest = (req) => {
  return req.headers["x-user-id"] || req.query.user_id;
};


const validateCart = async (req) => {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return {
      statusCode: 400,
      success: false,
      message: "user_id is required",
      data: null,
    };
  }

  const cart = await cartRepository.getCartByUserId(userId);

  if (!cart) {
    return {
      statusCode: 404,
      success: false,
      message: "Cart not found",
      data: null,
    };
  }

  const cartItems = await cartRepository.getCartItemsByCartId(cart.id);

  if (!cartItems.length) {
    return {
      statusCode: 200,
      success: true,
      message: "Cart is empty",
      data: {
        valid: false,
        cart_id: cart.id,
        invalid_items: [],
      },
    };
  }

  const invalidItems = [];

  for (const item of cartItems) {
    if (!item.product) {
      invalidItems.push({
        cart_item_id: item.id,
        product_id: item.product_id,
        reason: "Product not found",
      });
      continue;
    }

    if (item.product.stock < item.quantity) {
      invalidItems.push({
        cart_item_id: item.id,
        product_id: item.product_id,
        product_name: item.product.name,
        requested_quantity: item.quantity,
        available_stock: item.product.stock,
        reason: "Insufficient stock",
      });
    }
  }

  return {
    statusCode: 200,
    success: true,
    message: invalidItems.length === 0 ? "Cart is valid" : "Some cart items are invalid",
    data: {
      valid: invalidItems.length === 0,
      cart_id: cart.id,
      invalid_items: invalidItems,
    },
  };
};

const countCartItems = async (req) => {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return {
      statusCode: 400,
      success: false,
      message: "user_id is required",
      data: null,
    };
  }

  const cart = await cartRepository.getCartByUserId(userId);

  if (!cart) {
    return {
      statusCode: 200,
      success: true,
      message: "Cart count fetched successfully",
      data: {
        cart_id: null,
        total_items: 0,
        total_quantity: 0,
      },
    };
  }

  const count = await cartRepository.getCartCountByCartId(cart.id);

  return {
    statusCode: 200,
    success: true,
    message: "Cart count fetched successfully",
    data: {
      cart_id: cart.id,
      total_items: count.totalItems,
      total_quantity: count.totalQuantity,
    },
  };
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  clearCart,
  deleteCartItem,
  validateCart,
  countCartItems
};