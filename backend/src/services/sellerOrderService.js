const sellerOrderRepository = require("../repository/sellerOrderRepository");

const getSellerOrders = async (sellerId) => {
  const items = await sellerOrderRepository.findOrderItemsBySellerId(sellerId);

  return items.map((item) => ({
    id: item.order.id,
    order_item_id: item.id,
    buyerName: item.order.buyer?.full_name || "-",
    productName: item.product?.name || item.productNameSnap,
    qty: item.qty,
    total: Number(item.subtotal),
    status: item.status,
    createdAt: item.createdAt,
  }));
};

const processOrderItem = async (orderItemId, sellerId) => {
  const item = await sellerOrderRepository.findOrderItemById(orderItemId);
  if (!item) throw new Error("Order item tidak ditemukan");
  if (item.sellerId !== Number(sellerId)) throw new Error("Akses ditolak");
  if (item.status !== "menunggu_penjual") throw new Error("Status order item tidak valid untuk diproses");

  const updated = await sellerOrderRepository.updateOrderItemStatus(orderItemId, "diproses_penjual");
  await sellerOrderRepository.createStatusHistory({
    orderId: item.order.id,
    status: "diproses_penjual",
    updatedBy: Number(sellerId),
  });

  return {
    order_item_id: updated.id,
    status: updated.status,
  };
};

const readyToShipOrderItem = async (orderItemId, sellerId) => {
  const item = await sellerOrderRepository.findOrderItemById(orderItemId);
  if (!item) throw new Error("Order item tidak ditemukan");
  if (item.sellerId !== Number(sellerId)) throw new Error("Akses ditolak");
  if (item.status !== "diproses_penjual") throw new Error("Status order item tidak valid untuk siap kirim");

  const updated = await sellerOrderRepository.updateOrderItemStatus(orderItemId, "menunggu_kurir");
  await sellerOrderRepository.createStatusHistory({
    orderId: item.order.id,
    status: "menunggu_kurir",
    updatedBy: Number(sellerId),
  });

  return {
    order_item_id: updated.id,
    status: updated.status,
  };
};

module.exports = {
  getSellerOrders,
  processOrderItem,
  readyToShipOrderItem,
};
