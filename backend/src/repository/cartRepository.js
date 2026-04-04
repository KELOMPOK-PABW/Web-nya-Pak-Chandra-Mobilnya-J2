const prisma = require("../config/database");

const findActiveCartByUserId = async (userId) => {
  return prisma.cart.findFirst({
    where: {
      userId,
      status: "active",
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
};

const createCart = async (userId) => {
  return prisma.cart.create({
    data: {
      userId,
      status: "active",
    },
  });
};

const findProductById = async (productId) => {
  return prisma.product.findUnique({
    where: { id: productId },
  });
};

const findCartItemByCartIdAndProductId = async (cartId, productId) => {
  return prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId,
        productId,
      },
    },
  });
};

const createCartItem = async ({ cartId, productId, quantity }) => {
  return prisma.cartItem.create({
    data: {
      cartId,
      productId,
      quantity,
    },
  });
};

const updateCartItemQuantity = async (cartItemId, quantity) => {
  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
};

const getCartDetailByCartId = async (cartId) => {
  return prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
};

module.exports = {
  findActiveCartByUserId,
  createCart,
  findProductById,
  findCartItemByCartIdAndProductId,
  createCartItem,
  updateCartItemQuantity,
  getCartDetailByCartId,
};