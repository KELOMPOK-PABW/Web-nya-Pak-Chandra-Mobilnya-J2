const sellerOrderRepository = require("../repository/sellerOrderRepository");
const AppError = require("../utils/AppError");
const { mapStatusForResponse } = require("../utils/orderStatus");

const getSellerOrders = async (sellerId, { page = 1, limit = 10 } = {}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (safePage - 1) * safeLimit;

  const items = await sellerOrderRepository.findOrderItemsBySellerId(sellerId, {
    skip,
    take: safeLimit,
  });

  return {
    data: items.map((item) => ({
      order_id: item.order.id,
      order_item_id: item.id,
      product_name: item.product?.name || item.productNameSnap,
      qty: item.qty,
      price: Number(item.priceSnap),
      buyer_name: item.order.buyer?.fullName || "-",
      status: mapStatusForResponse(item.status),
      created_at: item.createdAt,
    })),
    meta: {
      page: safePage,
      limit: safeLimit,
    },
  };
};

const getSellerOrderById = async (orderId, sellerId) => {
  if (!orderId || Number.isNaN(Number(orderId))) {
    throw new AppError("Order ID tidak valid");
  }

  const order = await sellerOrderRepository.findOrderByIdForSeller(Number(orderId), sellerId);

  if (!order || order.items.length === 0) {
    throw new AppError("Order tidak ditemukan", 404);
  }

  const primaryStatus = order.items[0].status;

  return {
    order_id: order.id,
    buyer: {
      name: order.buyer?.fullName || "-",
      phone: order.buyer?.phone || "",
    },
    items: order.items.map((item) => ({
      order_item_id: item.id,
      product_name: item.productNameSnap,
      qty: item.qty,
      price: Number(item.priceSnap),
      status: mapStatusForResponse(item.status),
    })),
    shipping_address: order.address?.city || order.address?.address || "",
    status: mapStatusForResponse(primaryStatus),
  };
};

const processOrderItem = async (orderItemId, sellerId) => {
  const item = await sellerOrderRepository.findOrderItemById(orderItemId);
  if (!item) {
    throw new AppError("Order item tidak ditemukan", 404);
  }
  if (item.sellerId !== Number(sellerId)) {
    throw new AppError("Akses ditolak", 403);
  }
  if (item.status !== "menunggu_penjual") {
    throw new AppError("Status order item tidak valid untuk diproses");
  }

  const updated = await sellerOrderRepository.updateOrderItemStatus(orderItemId, "diproses_penjual");
  await sellerOrderRepository.createStatusHistory({
    orderId: item.orderId,
    status: "diproses_penjual",
    updatedBy: Number(sellerId),
  });

  return {
    order_item_id: updated.id,
    status: mapStatusForResponse(updated.status),
  };
};

const readyToShipOrderItem = async (orderItemId, sellerId) => {
  const item = await sellerOrderRepository.findOrderItemById(orderItemId);
  if (!item) {
    throw new AppError("Order item tidak ditemukan", 404);
  }
  if (item.sellerId !== Number(sellerId)) {
    throw new AppError("Akses ditolak", 403);
  }
  if (item.status !== "diproses_penjual") {
    throw new AppError("Status order item tidak valid untuk siap kirim");
  }

  const updated = await sellerOrderRepository.updateOrderItemStatus(orderItemId, "menunggu_kurir");
  await sellerOrderRepository.createStatusHistory({
    orderId: item.orderId,
    status: "menunggu_kurir",
    updatedBy: Number(sellerId),
  });

  return {
    order_item_id: updated.id,
    status: mapStatusForResponse(updated.status),
  };
};

module.exports = {
  getSellerOrders,
  getSellerOrderById,
  processOrderItem,
  readyToShipOrderItem,
};
