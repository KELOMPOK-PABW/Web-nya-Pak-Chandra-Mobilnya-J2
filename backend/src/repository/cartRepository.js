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

const findCartItemByIdAndUser = async (cartItemId, userId) => {
  return prisma.cartItem.findFirst({
    where: {
      id: Number(cartItemId),
      cart: {
        userId: Number(userId),
        status: "active",
      },
    },
    include: {
      product: true,
      cart: true,
    },
  });
};

const updateCartItemQuantity = async (cartItemId, quantity) => {
  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity, },
    include: {
      product : true
    }
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

const deleteCartItemById = async (cartItemId) => {
  return prisma.cartItem.delete({
    where: {
      id: Number(cartItemId),
    },
  });
};

const clearCartItemsByUserId = async (userId) => {
  const activeCart = await prisma.cart.findFirst({
    where: {
      userId: Number(userId),
      status: "active",
    },
    select: {
      id: true,
    },
  });

  if (!activeCart) {
    return {
      cart: null,
      deletedCount: 0,
    };
  }

  const deleted = await prisma.cartItem.deleteMany({
    where: {
      cartId: activeCart.id,
    },
  });

  return {
    cart: activeCart,
    deletedCount: deleted.count,
  };
};

const getCartByUserId = async(userID) => {
  return prisma.cart.findFirst({
    where : {userId : Number(userID)}
  })
}

const getCartItemByCartId = async (cartId) => {
  return prisma.cartItem.findUnique({
    where: {
      cartId: {
        cartId,
      },
    },
    include: {product: true}
  });
};

const getCartCountByCartId = async (cartId) => {
  const items = await prisma.cartItem.findMany({
    where: { cart_id: Number(cartId) },
    select: {
      quantity: true,
    },
  });

  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    totalItems,
    totalQuantity,
  };
};


module.exports = {
  findActiveCartByUserId,
  createCart,
  findProductById,
  findCartItemByCartIdAndProductId,
  createCartItem,
  updateCartItemQuantity,
  getCartDetailByCartId,
  deleteCartItemById,
  clearCartItemsByUserId,
  findCartItemByIdAndUser,
  getCartByUserId,
  getCartCountByCartId,
  getCartItemByCartId
};