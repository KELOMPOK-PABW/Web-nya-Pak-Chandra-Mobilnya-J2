const prisma = require("../config/database")

const findCartById = async(cartId) => {
    return prisma.cart.findUnique(
        {
            where : {id : cartId},
            include : {
                items : {
                    product : true
                },
                user : true,
            }
        }
    )
}

const findAddressById = async (addressId) => {
  return prisma.address.findUnique({
    where: { id: addressId },
  });
};

const createOrder = async (tx, data) => {
  return tx.order.create({
    data,
  });
};

const createManyOrderItems = async (tx, data) => {
  return tx.orderItem.createMany({
    data,
  });
};

const createOrderStatusHistory = async (tx, data) => {
  return tx.orderStatusHistory.create({
    data,
  });
};

const updateProductStock = async (tx, productId, newStock, newStockStatus) => {
  return tx.product.update({
    where: { id: productId },
    data: {
      stock: newStock,
      stockStatus: newStockStatus,
    },
  });
};

const updateCartToCheckedOut = async (tx, cartId) => {
  return tx.cart.update({
    where: { id: cartId },
    data: {
      status: "checked_out",
      checkedOutAt: new Date(),
    },
  });
};

module.exports = {
  findCartById,
  findAddressById,
  createOrder,
  createManyOrderItems,
  createOrderStatusHistory,
  updateProductStock,
  updateCartToCheckedOut,
};