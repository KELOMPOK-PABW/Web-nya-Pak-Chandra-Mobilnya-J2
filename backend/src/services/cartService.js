const cartRepository = require("../repository/cartRepository");

const formatCartResponse = (cart) => {
  const items = (cart.items || []).map((item) => ({
    id: item.id,
    cartId: item.cartId,
    product: {
      id: item.productListId,
      name: item.product.name,
      price: item.product.price,
    },
    qty: item.qty,
    subtotal: item.product.price * item.qty,
  }));

  return items;
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
    finalQty = existingItem.qty + qty;

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
      qty,
    });
  }

  return {
    product_id,
    qty: finalQty,
  };
};

const updateCartItem = async({ cartItemId, quantity, userId }) => {
  const cartItem = await cartRepository.findCartItemByIdAndUser(cartItemId, userId)
  if (!cartItem) {
    throw new Error("Item cart tidak ditemukan");
  }

  if (quantity > cartItem.product.stock) {
    throw new Error("Qty melebihi stock produk");
  }

  const updateItem = await cartRepository.updateCartItemQuantity(Number(cartItemId), quantity)
  return {
    id : updateItem.id,
    qty : updateItem.qty,
    subtotal : Number(updateItem.qty) * Number(updateItem.product.price)
  }
}

const deleteCartItem = async({ cartItemId, userId }) => {
  const findCartItem = await cartRepository.findCartItemByIdAndUser(cartItemId, userId)

  if (!findCartItem){
    throw new Error("Item cart tidak ditemukan")
  }

  await cartRepository.deleteCartItemById(cartItemId)
  
  return {
    message : "Product dihapus dari cart"
  }
}

const clearCart = async ({ user_id }) => {
  await cartRepository.clearCartItemsByUserId(user_id);
  return { message: "Cart dikosongkan" };
};

const validateCart = async ({ userId }) => {
  if (!userId) {
    return { statusCode: 400, success: false, message: "user_id is required", data: null };
  }

  const cart = await cartRepository.getCartByUserId(userId);
  if (!cart) {
    return { statusCode: 404, success: false, message: "Cart not found", data: null };
  }

  const cartItems = await cartRepository.getCartItemsByCartId(cart.id);
  if (!cartItems.length) {
    return { statusCode: 200, success: true, message: "Cart is empty", data: { valid: false, cart_id: cart.id, invalid_items: [] } };
  }

  const invalidItems = [];
  for (const item of cartItems) {
    if (!item.product) {
      invalidItems.push({ cart_item_id: item.id, product_id: item.productListId, reason: "Product not found" });
      continue;
    }
    if (item.product.stock < item.qty) {
      invalidItems.push({
        cart_item_id: item.id,
        product_id: item.productListId,
        product_name: item.product.name,
        requested_quantity: item.qty,
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

const countCartItems = async ({ userId }) => {
  if (!userId) {
    return { statusCode: 400, success: false, message: "user_id is required", data: null };
  }

  const cart = await cartRepository.getCartByUserId(userId);
  if (!cart) {
    return {
      statusCode: 200, success: true, message: "Cart count fetched successfully",
      data: { cart_id: null, total_items: 0, total_quantity: 0 },
    };
  }

  const count = await cartRepository.getCartCountByCartId(cart.id);
  return {
    statusCode: 200, success: true, message: "Cart count fetched successfully",
    data: { cart_id: cart.id, total_items: count.totalItems, total_quantity: count.totalQuantity },
  };
};

module.exports = {
  getCart, addItemToCart, updateCartItem, clearCart, deleteCartItem, validateCart, countCartItems
};
