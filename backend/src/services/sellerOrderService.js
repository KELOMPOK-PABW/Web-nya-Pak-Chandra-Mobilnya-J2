const sellerOrderRepository = require("../repository/sellerOrderRepository");
const AppError = require("../utils/AppError");
const { mapStatusForResponse } = require("../utils/orderStatus");

const formatAddress = (address) => {
  if (!address) return "";
  return [address.address, address.city, address.postalCode].filter(Boolean).join(", ");
};

const normalizeItem = (item) => {
  const price = Number(item.priceSnap || 0);
  const qty = Number(item.qty || 0);

  return {
    id: item.orderId,
    order_id: item.orderId,
    order_item_id: item.id,
    buyer_name: item.order?.buyer?.fullName || "-",
    buyer_email: item.order?.buyer?.email || "",
    buyer_phone: item.order?.buyer?.phone || "",
    product_id: item.product?.id || item.productListId,
    product_name: item.product?.name || item.productNameSnap || "-",
    product_image_url: item.product?.imageUrl || "",
    qty,
    price,
    subtotal: price * qty,
    total: price * qty,
    status: mapStatusForResponse(item.status),
    raw_status: item.status,
    created_at: item.createdAt,
    address: item.order?.address
      ? {
          ...item.order.address,
          postal_code: item.order.address.postalCode,
        }
      : null,
    shipping_address: formatAddress(item.order?.address),
  };
};

const normalizeOrder = (order) => {
  const firstItem = order.items?.[0];
  const total = order.items.reduce((sum, item) => sum + Number(item.priceSnap || 0) * Number(item.qty || 0), 0);

  return {
    id: order.id,
    order_id: order.id,
    order_item_id: firstItem?.id,
    buyer_name: order.buyer?.fullName || "-",
    buyer_email: order.buyer?.email || "",
    buyer_phone: order.buyer?.phone || "",
    product_name: firstItem?.product?.name || firstItem?.productNameSnap || "-",
    qty: firstItem?.qty || 0,
    price: Number(firstItem?.priceSnap || 0),
    subtotal: total,
    total,
    status: mapStatusForResponse(firstItem?.status || "menunggu_penjual"),
    raw_status: firstItem?.status || "menunggu_penjual",
    created_at: firstItem?.createdAt || order.createdAt,
    address: order.address
      ? {
          ...order.address,
          postal_code: order.address.postalCode,
        }
      : null,
    shipping_address: formatAddress(order.address),
    items: order.items.map((item) => ({
      order_item_id: item.id,
      product_id: item.product?.id || item.productListId,
      product_name: item.product?.name || item.productNameSnap || "-",
      product_image_url: item.product?.imageUrl || "",
      qty: item.qty,
      price: Number(item.priceSnap || 0),
      subtotal: Number(item.priceSnap || 0) * Number(item.qty || 0),
      status: mapStatusForResponse(item.status),
      raw_status: item.status,
    })),
  };
};

const getSellerOrders = async (sellerId, { page = 1, limit = 10 } = {}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    sellerOrderRepository.findOrderItemsBySellerId(sellerId, {
      skip,
      take: safeLimit,
    }),
    sellerOrderRepository.countOrderItemsBySellerId(sellerId),
  ]);

  return {
    data: items.map(normalizeItem),
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

const getSellerOrderById = async (id, sellerId) => {
  if (!id || Number.isNaN(Number(id))) {
    throw new AppError("Order ID tidak valid");
  }

  const item = await sellerOrderRepository.findOrderItemById(id);
  if (item && item.sellerId === Number(sellerId)) {
    return normalizeItem(item);
  }

  const order = await sellerOrderRepository.findOrderByIdForSeller(id, sellerId);
  if (!order || order.items.length === 0) {
    throw new AppError("Order tidak ditemukan", 404);
  }

  return normalizeOrder(order);
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
    order_id: updated.orderId,
    order_item_id: updated.id,
    status: mapStatusForResponse(updated.status),
    raw_status: updated.status,
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
    order_id: updated.orderId,
    order_item_id: updated.id,
    status: mapStatusForResponse(updated.status),
    raw_status: updated.status,
  };
};

module.exports = {
  getSellerOrders,
  getSellerOrderById,
  processOrderItem,
  readyToShipOrderItem,
};
