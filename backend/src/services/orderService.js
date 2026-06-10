const orderRepository = require("../repository/orderRepository");
const AppError = require("../utils/AppError");
const { mapStatusForResponse } = require("../utils/orderStatus");

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
    throw new AppError("Order tidak ditemukan", 404);
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
      store_name: item.seller ? item.seller.fullName : "-",
      qty: item.qty,
      price: Number(item.priceSnap),
    })),
  };
};

const getOrderItems = async (orderId, buyerId) => {
  if (!orderId || isNaN(orderId)) {
    throw new Error("Order ID tidak valid");
  }

  const order = await orderRepository.findOrderByIdForBuyer(Number(orderId), buyerId);

  if (!order) {
    throw new AppError("Order tidak ditemukan", 404);
  }

  const items = await orderRepository.findOrderItemsByOrderId(Number(orderId));

  return items.map((item) => ({
    order_item_id: item.id,
    product_name: item.productNameSnap,
    status: item.status,
  }));
};

const getStatusHistory = async (orderId, buyerId) => {
  if (!orderId || isNaN(orderId)) {
    throw new Error("Order ID tidak valid");
  }

  const order = await orderRepository.findOrderMetaByIdForBuyer(Number(orderId), buyerId);

  if (!order) {
    throw new AppError("Order tidak ditemukan", 404);
  }

  const histories = await orderRepository.findStatusHistoryByOrderId(Number(orderId));

  const events = histories.map((entry) => ({
    status: mapStatusForResponse(entry.status),
    created_at: entry.createdAt,
  }));

  if (order.paidAt) {
    events.push({
      status: mapStatusForResponse("paid"),
      created_at: order.paidAt,
    });
  }

  events.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return events;
};

const cancelOrder = async (orderId, buyerId) => {
  if (!orderId || isNaN(orderId)) {
    throw new Error("Order ID tidak valid");
  }

  const order = await orderRepository.findOrderWithItemsAndPayment(Number(orderId), buyerId);

  if (!order) {
    throw new AppError("Order tidak ditemukan", 404);
  }

  if (order.items.every((item) => item.status === "transaksi_gagal")) {
    throw new AppError("Pesanan sudah dibatalkan");
  }

  if (order.paymentStatus !== "pending") {
    throw new AppError("Pesanan tidak dapat dibatalkan karena pembayaran sudah lunas");
  }

  if (!order.payment || order.payment.status !== "pending") {
    throw new AppError("Pesanan tidak dapat dibatalkan karena pembayaran sudah lunas");
  }

  const hasProcessedItem = order.items.some((item) => item.status !== "menunggu_penjual");
  if (hasProcessedItem) {
    throw new AppError("Pesanan tidak dapat dibatalkan karena sudah diproses penjual");
  }

  await orderRepository.cancelOrder(Number(orderId), buyerId, buyerId);

  return { status: "transaksi gagal" };
};

const confirmOrder = async (orderId, buyerId) => {
  if (!orderId || isNaN(orderId)) {
    throw new Error("Order ID tidak valid");
  }

  const order = await orderRepository.findOrderWithItemsAndPayment(Number(orderId), buyerId);

  if (!order) {
    throw new AppError("Order tidak ditemukan", 404);
  }

  if (order.items.length === 0) {
    throw new AppError("Pesanan tidak memiliki item");
  }

  if (order.items.every((item) => item.status === "diterima_pembeli")) {
    throw new AppError("Pesanan sudah dikonfirmasi");
  }

  const allArrived = order.items.every((item) => item.status === "sampai_di_tujuan");
  if (!allArrived) {
    throw new AppError("Semua item harus sudah sampai di tujuan");
  }

  await orderRepository.confirmOrderReceived(Number(orderId), buyerId, buyerId);

  return { status: "diterima pembeli" };
};

const completeOrderItem = async (orderItemId, buyerId) => {
  if (!orderItemId || isNaN(orderItemId)) {
    throw new Error("Order item ID tidak valid");
  }

  const item = await orderRepository.findOrderItemByIdForBuyer(Number(orderItemId), buyerId);

  if (!item) {
    throw new AppError("Order item tidak ditemukan", 404);
  }

  if (item.status === "diterima_pembeli") {
    throw new AppError("Pesanan sudah diselesaikan");
  }

  if (item.status !== "sampai_di_tujuan") {
    throw new AppError("Item harus sudah sampai di tujuan");
  }

  const result = await orderRepository.completeOrderItem(Number(orderItemId), buyerId, buyerId);

  if (!result) {
    throw new AppError("Order item tidak ditemukan", 404);
  }

  return {
    order_item_id: result.item.id,
    status: "completed",
    completed_at: result.completedAt,
  };
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrderItems,
  getStatusHistory,
  cancelOrder,
  confirmOrder,
  completeOrderItem,
};
