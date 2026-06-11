const orderRepository = require("../repository/orderRepository");

const ORDER_ITEM_FLOW = [
  "menunggu_penjual",
  "diproses_penjual",
  "menunggu_kurir",
  "sedang_dikirim",
  "sampai_di_tujuan",
  "diterima_pembeli",
];

const deriveOrderStatus = (order) => {
  if (!order) return "pending";
  if (order.paymentStatus === "failed") return "cancelled";
  if (order.paymentStatus === "pending") return "pending";

  const statuses = order.items?.map((item) => item.status) || [];
  if (statuses.length === 0) return order.paymentStatus || "pending";
  if (statuses.every((status) => status === "transaksi_gagal")) return "cancelled";
  if (statuses.every((status) => status === "diterima_pembeli")) return "completed";
  if (statuses.some((status) => status === "sampai_di_tujuan")) return "delivered";
  if (statuses.some((status) => status === "sedang_dikirim")) return "shipped";
  if (statuses.some((status) => status === "menunggu_kurir" || status === "diproses_penjual")) return "processing";
  return "menunggu_penjual";
};

const getAllOrders = async (buyerId) => {
  const orders = await orderRepository.findOrdersByBuyerId(buyerId);

  return orders.map((order) => ({
    id: order.id,
    status: deriveOrderStatus(order),
    payment_status: order.paymentStatus,
    total_price: Number(order.totalAmount),
    created_at: order.createdAt,
    item_count: order.items?.length || 0,
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
    status: deriveOrderStatus(order),
    payment_status: order.paymentStatus,
    total_price: Number(order.totalAmount),
    created_at: order.createdAt,
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
      subtotal: Number(item.subtotal),
      status: item.status,
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

const getOrderHistory = async (orderId, buyerId) => {
  if (!orderId || isNaN(orderId)) {
    throw new Error("Order ID tidak valid");
  }

  const order = await orderRepository.findOrderByIdForBuyer(Number(orderId), buyerId);
  if (!order) {
    throw new Error("Order tidak ditemukan");
  }

  const history = await orderRepository.findOrderHistoryByOrderId(Number(orderId));
  return history.map((entry) => ({
    id: entry.id,
    status: entry.status,
    created_at: entry.createdAt,
  }));
};

const cancelOrder = async (orderId, buyerId) => {
  if (!orderId || isNaN(orderId)) {
    throw new Error("Order ID tidak valid");
  }

  const order = await orderRepository.findOrderByIdForBuyer(Number(orderId), buyerId);
  if (!order) {
    throw new Error("Order tidak ditemukan");
  }

  const currentStatus = deriveOrderStatus(order);
  if (["shipped", "delivered", "completed", "cancelled"].includes(currentStatus)) {
    throw new Error("Pesanan tidak dapat dibatalkan pada status ini");
  }

  await orderRepository.updateOrderItemsStatus(Number(orderId), "transaksi_gagal");
  await orderRepository.updateOrderPaymentStatus(Number(orderId), "failed");
  await orderRepository.updatePaymentStatus(Number(orderId), "failed");
  await orderRepository.createOrderStatusHistory({
    orderId: Number(orderId),
    status: "transaksi_gagal",
    updatedBy: buyerId,
  });

  return getOrderById(Number(orderId), buyerId);
};

const confirmOrder = async (orderId, buyerId) => {
  if (!orderId || isNaN(orderId)) {
    throw new Error("Order ID tidak valid");
  }

  const order = await orderRepository.findOrderByIdForBuyer(Number(orderId), buyerId);
  if (!order) {
    throw new Error("Order tidak ditemukan");
  }

  const currentStatus = deriveOrderStatus(order);
  if (!["shipped", "delivered"].includes(currentStatus)) {
    throw new Error("Pesanan hanya bisa dikonfirmasi setelah dikirim atau sampai tujuan");
  }

  await orderRepository.updateOrderItemsStatus(Number(orderId), "diterima_pembeli");
  await orderRepository.createOrderStatusHistory({
    orderId: Number(orderId),
    status: "diterima_pembeli",
    updatedBy: buyerId,
  });

  return getOrderById(Number(orderId), buyerId);
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrderItems,
  getOrderHistory,
  cancelOrder,
  confirmOrder,
};
