const orderRepository = require("../repository/orderRepository");

const getAllOrders = async (buyerId) => {
  const orders = await orderRepository.findOrdersByBuyerId(buyerId);

  return orders.map((order) => ({
    id: order.id,
    status: order.paymentStatus,
    total_price: Number(order.totalAmount),
  }));
};

const getOrderById = async (orderId, buyerId) => {
  if (!orderId || isNaN(orderId)) {
    throw new Error("Order ID tidak valid");
  }

  const order = await orderRepository.findOrderByIdForBuyer(Number(orderId), buyerId);

  if (!order) {
    throw new Error("Order tidak ditemukan");
  }

  return {
    order_id: order.id,
    payment_status: order.paymentStatus,
    address: order.address
      ? {
        address: order.address.address,
        city: order.address.city,
      }
      : null,
    items: order.items.map((item) => ({
      product_name: item.productNameSnap,
      store_name: item.seller ? item.seller.full_name : "-",
      qty: item.qty,
      price: Number(item.priceSnap),
    })),
  };
};

const getOrderItems = async (orderId, buyerId) => {
  if (!orderId || isNaN(orderId)) {
    throw new Error("Order ID tidak valid");
  }

  // Verify order ownership first
  const order = await orderRepository.findOrderByIdForBuyer(Number(orderId), buyerId);

  if (!order) {
    throw new Error("Order tidak ditemukan");
  }

  const items = await orderRepository.findOrderItemsByOrderId(Number(orderId));

  return items.map((item) => ({
    order_item_id: item.id,
    product_name: item.productNameSnap,
    status: item.status,
  }));
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrderItems,
};
