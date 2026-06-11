const sellerOrderRepository = require("../repository/sellerOrderRepository");

function normalizeOrderItem(item) {
  return {
    id: item.orderId,
    order_id: item.orderId,
    order_item_id: item.id,
    buyer_name: item.order?.buyer?.fullName ?? "-",
    buyer_email: item.order?.buyer?.email ?? "-",
    buyer_phone: item.order?.buyer?.phone ?? "-",
    product_id: item.productId,
    product_name: item.productNameSnap ?? item.product?.name ?? "-",
    product_image_url: item.product?.imageUrl ?? null,
    qty: item.qty,
    price: Number(item.priceSnap || 0),
    subtotal: Number(item.subtotal || 0),
    total: Number(item.subtotal || 0),
    status: item.status,
    created_at: item.createdAt,
    address: item.order?.address
      ? {
        address: item.order.address.address,
        city: item.order.address.city,
        postal_code: item.order.address.postalCode,
      }
      : null,
  };
}

const getSellerOrders = async (sellerId) => {
  const items = await sellerOrderRepository.findBySellerId(sellerId);
  return items.map(normalizeOrderItem);
};

const getSellerOrderById = async (id, sellerId) => {
  const itemId = Number(id);
  if (!itemId || Number.isNaN(itemId)) {
    throw new Error("ID pesanan tidak valid");
  }

  const item = await sellerOrderRepository.findByIdAndSellerId(itemId, sellerId);
  if (!item) {
    throw new Error("Pesanan tidak ditemukan");
  }

  return normalizeOrderItem(item);
};

const processOrder = async (id, sellerId) => {
  const item = await sellerOrderRepository.findByIdAndSellerId(Number(id), sellerId);
  if (!item) {
    throw new Error("Pesanan tidak ditemukan");
  }
  if (item.status !== "menunggu_penjual") {
    throw new Error("Pesanan tidak dapat diproses pada status ini");
  }

  await sellerOrderRepository.updateStatus(item.id, sellerId, "diproses_penjual");
  await sellerOrderRepository.createHistory({
    orderId: item.orderId,
    status: "diproses_penjual",
    updatedBy: sellerId,
  });

  return getSellerOrderById(item.id, sellerId);
};

const readyToShipOrder = async (id, sellerId) => {
  const item = await sellerOrderRepository.findByIdAndSellerId(Number(id), sellerId);
  if (!item) {
    throw new Error("Pesanan tidak ditemukan");
  }
  if (item.status !== "diproses_penjual") {
    throw new Error("Pesanan harus diproses terlebih dahulu");
  }

  await sellerOrderRepository.updateStatus(item.id, sellerId, "menunggu_kurir");
  await sellerOrderRepository.createHistory({
    orderId: item.orderId,
    status: "menunggu_kurir",
    updatedBy: sellerId,
  });

  return getSellerOrderById(item.id, sellerId);
};

module.exports = {
  getSellerOrders,
  getSellerOrderById,
  processOrder,
  readyToShipOrder,
};
