const courierRepository = require("../repository/courierRepository");
const sellerOrderRepository = require("../repository/sellerOrderRepository");
const authRepository = require("../repository/authRepository");
const AppError = require("../utils/AppError");

const assertAdmin = (role) => {
  if (role !== "admin") {
    throw new AppError("Akses ditolak", 403);
  }
};

const formatStatusLabel = (assignment) => {
  if (assignment.deliveredAt) return "sampai di tujuan";
  const itemStatus = assignment.orderItem?.status;
  if (itemStatus === "dikirim_balik") return "dikirim balik";
  if (itemStatus === "menunggu_kurir") return "menunggu kurir";
  if (itemStatus) return itemStatus.replace(/_/g, " ");
  if (assignment.pickupAt) return "sedang dikirim";
  return "menunggu kurir";
};

const getPickupAddress = (orderItem) => {
  const storeName = orderItem?.seller?.stores?.[0]?.storeName;
  if (storeName) return storeName;
  return orderItem?.seller?.fullName || "Toko";
};

const getDeliveryAddress = (orderItem) => {
  const city = orderItem?.order?.address?.city;
  if (city) return city;
  return orderItem?.order?.address?.address || "-";
};

const assignCourier = async ({ orderItemId, kurirId, requesterRole }) => {
  assertAdmin(requesterRole);

  const orderItem = await sellerOrderRepository.findOrderItemById(orderItemId);
  if (!orderItem) {
    throw new AppError("Order item tidak ditemukan", 404);
  }
  if (orderItem.status !== "menunggu_kurir") {
    throw new AppError("Order item belum siap ditugaskan ke kurir", 400);
  }

  const existing = await courierRepository.findAssignmentByOrderItemId(orderItemId);
  if (existing) {
    throw new AppError("Kurir sudah ditugaskan untuk order item ini", 409);
  }

  const kurir = await authRepository.findUserById(Number(kurirId));
  if (!kurir || !kurir.isActive) {
    throw new AppError("Kurir tidak ditemukan", 404);
  }

  const kurirRole = kurir.roles?.[0]?.role?.nameRole;
  if (kurirRole !== "kurir") {
    throw new AppError("User bukan kurir", 400);
  }

  const assignment = await courierRepository.createAssignment({
    orderItemId: Number(orderItemId),
    kurirId: Number(kurirId),
  });

  return {
    id: assignment.id,
    order_item_id: assignment.orderItemId,
    kurir_id: assignment.kurirId,
    assigned_at: assignment.assignedAt,
  };
};

const getAssignmentDetail = async (assignmentId, requesterRole) => {
  assertAdmin(requesterRole);

  const assignment = await courierRepository.findAssignmentById(Number(assignmentId));
  if (!assignment) {
    throw new AppError("Assignment tidak ditemukan", 404);
  }

  return {
    assignment_id: assignment.id,
    courier_id: assignment.kurirId,
    order_item_id: assignment.orderItemId,
    status: formatStatusLabel(assignment),
    assigned_at: assignment.assignedAt,
  };
};

const getCourierTasks = async (kurirId) => {
  const assignments = await courierRepository.findAssignmentsByKurirId(kurirId);

  return assignments.map((assignment) => ({
    assignment_id: assignment.id,
    order_item_id: assignment.orderItemId,
    product_name: assignment.orderItem.product?.name || assignment.orderItem.productNameSnap,
    pickup_address: getPickupAddress(assignment.orderItem),
    delivery_address: getDeliveryAddress(assignment.orderItem),
    status: formatStatusLabel(assignment),
  }));
};

const getTasks = async (kurirId) => {
  const assignments = await courierRepository.findAssignmentsByKurirId(kurirId);

  return assignments.map((assignment) => ({
    assignment_id: assignment.id,
    order_item_id: assignment.orderItemId,
    product_name: assignment.orderItem.product?.name || assignment.orderItem.productNameSnap,
    store_name: assignment.orderItem.seller?.stores?.[0]?.storeName || assignment.orderItem.seller?.fullName || "-",
    pickup_address: getPickupAddress(assignment.orderItem),
    delivery_address: getDeliveryAddress(assignment.orderItem),
    buyer_name: assignment.orderItem.order?.buyer?.fullName || "-",
    buyer_phone: assignment.orderItem.order?.buyer?.phone || "-",
    status: formatStatusLabel(assignment),
    pickup_at: assignment.pickupAt,
    delivered_at: assignment.deliveredAt,
    created_at: assignment.assignedAt,
  }));
};

const getTaskDetail = async (assignmentId) => {
  const assignment = await courierRepository.findAssignmentById(Number(assignmentId));
  if (!assignment) throw new AppError("Tugas tidak ditemukan", 404);

  return {
    assignment_id: assignment.id,
    order_item_id: assignment.orderItemId,
    product_name: assignment.orderItem.product?.name || assignment.orderItem.productNameSnap,
    store_name: assignment.orderItem.seller?.stores?.[0]?.storeName || assignment.orderItem.seller?.fullName || "-",
    store_phone: assignment.orderItem.seller?.phone || "-",
    pickup_address: getPickupAddress(assignment.orderItem),
    delivery_address: getDeliveryAddress(assignment.orderItem),
    buyer_name: assignment.orderItem.order?.buyer?.fullName || "-",
    buyer_phone: assignment.orderItem.order?.buyer?.phone || "-",
    status: formatStatusLabel(assignment),
    pickup_at: assignment.pickupAt,
    delivered_at: assignment.deliveredAt,
    created_at: assignment.assignedAt,
  };
};

const pickup = async (orderItemId, kurirId) => {
  const assignment = await courierRepository.findAssignmentByOrderItemId(Number(orderItemId));
  if (!assignment) throw new AppError("Tugas tidak ditemukan", 404);
  if (assignment.kurirId !== Number(kurirId)) throw new AppError("Akses ditolak", 403);
  if (assignment.pickupAt) throw new AppError("Sudah di-pickup", 400);

  await courierRepository.updatePickup(assignment.id);
  await sellerOrderRepository.updateOrderItemStatus(assignment.orderItemId, "sedang_dikirim");
  const orderItem = await sellerOrderRepository.findOrderItemById(assignment.orderItemId);
  await sellerOrderRepository.createStatusHistory({
    orderId: orderItem.orderId,
    status: "sedang_dikirim",
    updatedBy: Number(kurirId),
  });

  return { status: "sedang_dikirim", pickup_at: new Date() };
};

const deliver = async (orderItemId, kurirId) => {
  const assignment = await courierRepository.findAssignmentByOrderItemId(Number(orderItemId));
  if (!assignment) throw new AppError("Tugas tidak ditemukan", 404);
  if (assignment.kurirId !== Number(kurirId)) throw new AppError("Akses ditolak", 403);
  if (!assignment.pickupAt) throw new AppError("Belum di-pickup", 400);
  if (assignment.deliveredAt) throw new AppError("Sudah diantar", 400);

  await courierRepository.updateDelivered(assignment.id);
  await sellerOrderRepository.updateOrderItemStatus(assignment.orderItemId, "sampai_di_tujuan");
  const orderItem = await sellerOrderRepository.findOrderItemById(assignment.orderItemId);
  await sellerOrderRepository.createStatusHistory({
    orderId: orderItem.orderId,
    status: "sampai_di_tujuan",
    updatedBy: Number(kurirId),
  });

  return { status: "sampai_di_tujuan", delivered_at: new Date() };
};

const returnToSeller = async (orderItemId, kurirId) => {
  const assignment = await courierRepository.findAssignmentByOrderItemId(Number(orderItemId));
  if (!assignment) throw new AppError("Tugas tidak ditemukan", 404);
  if (assignment.kurirId !== Number(kurirId)) throw new AppError("Akses ditolak", 403);
  if (!assignment.pickupAt) throw new AppError("Belum di-pickup", 400);
  if (assignment.deliveredAt) throw new AppError("Sudah diantar", 400);

  // Mark order item as returned to seller
  await sellerOrderRepository.updateOrderItemStatus(assignment.orderItemId, "dikirim_balik");
  const orderItem = await sellerOrderRepository.findOrderItemById(assignment.orderItemId);
  await sellerOrderRepository.createStatusHistory({
    orderId: orderItem.orderId,
    status: "dikirim_balik",
    updatedBy: Number(kurirId),
  });

  return { status: "dikirim_balik" };
};

module.exports = {
  assignCourier,
  getAssignmentDetail,
  getCourierTasks,
  getTasks,
  getTaskDetail,
  pickup,
  deliver,
  returnToSeller,
};
