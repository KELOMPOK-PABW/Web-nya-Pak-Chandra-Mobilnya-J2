const courierRepository = require("../repository/courierRepository");
const sellerOrderRepository = require("../repository/sellerOrderRepository");
const AppError = require("../utils/AppError");

const getTasks = async (kurirId) => {
  const assignments = await courierRepository.findAssignmentsByKurirId(kurirId);

  return assignments.map((a) => ({
    assignment_id: a.id,
    order_item_id: a.orderItemId,
    product_name: a.orderItem.product?.name || a.orderItem.productNameSnap,
    store_name: a.orderItem.seller?.fullName || "-",
    pickup_address: `${a.orderItem.seller?.fullName || "Toko"}, ${a.orderItem.order?.address?.address || ""}`,
    delivery_address: `${a.orderItem.order?.address?.address || ""}, ${a.orderItem.order?.address?.city || ""}`,
    buyer_name: a.orderItem.order?.buyer?.fullName || "-",
    buyer_phone: a.orderItem.order?.buyer?.phone || "-",
    status: getStatusLabel(a),
    pickup_at: a.pickupAt,
    delivered_at: a.deliveredAt,
    created_at: a.assignedAt,
  }));
};

const getTaskDetail = async (assignmentId) => {
  const a = await courierRepository.findAssignmentById(Number(assignmentId));
  if (!a) throw new AppError("Tugas tidak ditemukan", 404);

  return {
    assignment_id: a.id,
    order_item_id: a.orderItemId,
    product_name: a.orderItem.product?.name || a.orderItem.productNameSnap,
    store_name: a.orderItem.seller?.fullName || "-",
    store_phone: a.orderItem.seller?.phone || "-",
    pickup_address: `${a.orderItem.seller?.fullName || "Toko"}, ${a.orderItem.order?.address?.address || ""}`,
    delivery_address: `${a.orderItem.order?.address?.address || ""}, ${a.orderItem.order?.address?.city || ""}`,
    buyer_name: a.orderItem.order?.buyer?.fullName || "-",
    buyer_phone: a.orderItem.order?.buyer?.phone || "-",
    status: getStatusLabel(a),
    pickup_at: a.pickupAt,
    delivered_at: a.deliveredAt,
    created_at: a.assignedAt,
  };
};

const pickup = async (assignmentId, kurirId) => {
  const a = await courierRepository.findAssignmentById(Number(assignmentId));
  if (!a) throw new AppError("Tugas tidak ditemukan", 404);
  if (a.kurirId !== Number(kurirId)) throw new AppError("Akses ditolak", 403);
  if (a.pickupAt) throw new Error("Sudah di-pickup");

  await courierRepository.updatePickup(a.id);
  await sellerOrderRepository.updateOrderItemStatus(a.orderItemId, "sedang_dikirim");
  await sellerOrderRepository.createStatusHistory({
    orderId: a.orderItem.orderId,
    status: "sedang_dikirim",
    updatedBy: Number(kurirId),
  });

  return { status: "sedang_dikirim", pickup_at: new Date() };
};

const deliver = async (assignmentId, kurirId) => {
  const a = await courierRepository.findAssignmentById(Number(assignmentId));
  if (!a) throw new AppError("Tugas tidak ditemukan", 404);
  if (a.kurirId !== Number(kurirId)) throw new AppError("Akses ditolak", 403);
  if (!a.pickupAt) throw new Error("Belum di-pickup");
  if (a.deliveredAt) throw new Error("Sudah diantar");

  await courierRepository.updateDelivered(a.id);
  await sellerOrderRepository.updateOrderItemStatus(a.orderItemId, "sampai_di_tujuan");
  await sellerOrderRepository.createStatusHistory({
    orderId: a.orderItem.orderId,
    status: "sampai_di_tujuan",
    updatedBy: Number(kurirId),
  });

  return { status: "sampai_di_tujuan", delivered_at: new Date() };
};

function getStatusLabel(a) {
  if (a.deliveredAt) return "sampai_di_tujuan";
  if (a.pickupAt) return "sedang_dikirim";
  return "menunggu_kurir";
}

module.exports = {
  getTasks,
  getTaskDetail,
  pickup,
  deliver,
};
