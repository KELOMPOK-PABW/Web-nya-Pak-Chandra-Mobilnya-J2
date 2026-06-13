const prisma = require("../config/database");

const findAssignmentsByKurirId = async (kurirId) => {
  return prisma.kurirAssignment.findMany({
    where: { kurirId: Number(kurirId) },
    include: {
      orderItem: {
        include: {
          product: { select: { name: true } },
          order: {
            select: {
              buyer: { select: { fullName: true, phone: true } },
              address: { select: { address: true, city: true } },
            },
          },
          seller: {
            select: {
              fullName: true,
              stores: { select: { storeName: true }, take: 1 },
            },
          },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });
};

const findAssignmentById = async (id) => {
  return prisma.kurirAssignment.findUnique({
    where: { id: Number(id) },
    include: {
      orderItem: {
        include: {
          product: { select: { name: true } },
          order: {
            select: {
              buyer: { select: { fullName: true, phone: true } },
              address: { select: { address: true, city: true } },
            },
          },
          seller: {
            select: {
              fullName: true,
              phone: true,
              stores: { select: { storeName: true }, take: 1 },
            },
          },
        },
      },
    },
  });
};

const findAssignmentByOrderItemId = async (orderItemId) => {
  // Validate input: return null when no orderItemId provided
  if (orderItemId === undefined || orderItemId === null) return null;
  const id = Number(orderItemId);
  if (Number.isNaN(id)) return null;

  // Use findFirst because orderItemId may not be a unique field in the schema
  return prisma.kurirAssignment.findFirst({
    where: { orderItemId: id },
  });
};

const createAssignment = async (data) => {
  return prisma.kurirAssignment.create({ data });
};

const updatePickup = async (id) => {
  return prisma.kurirAssignment.update({
    where: { id: Number(id) },
    data: { pickupAt: new Date() },
  });
};

const updateDelivered = async (id) => {
  return prisma.kurirAssignment.update({
    where: { id: Number(id) },
    data: { deliveredAt: new Date() },
  });
};

module.exports = {
  findAssignmentsByKurirId,
  findAssignmentById,
  findAssignmentByOrderItemId,
  createAssignment,
  updatePickup,
  updateDelivered,
};
