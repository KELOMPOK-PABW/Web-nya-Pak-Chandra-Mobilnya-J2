const prisma = require("../config/database");

// ---- From HEAD branch ----

const findByUserId = async (userId) => {
  return prisma.sellerApplication.findUnique({
    where: { userId: Number(userId) },
  });
};

const findAll = async () => {
  return prisma.sellerApplication.findMany({
    include: {
      user: { select: { fullName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const create = async (data) => {
  return prisma.sellerApplication.create({ data });
};

const updateStatus = async (id, status, reviewerNote) => {
  return prisma.sellerApplication.update({
    where: { id: Number(id) },
    data: {
      status,
      reviewerNote: reviewerNote || null,
      reviewedAt: new Date(),
    },
  });
};

// ---- From main branch ----

const createApplication = async (data) => {
  return await prisma.sellerApplication.create({
    data,
  });
};

const getApplications = async () => {
  return await prisma.sellerApplication.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const getApplicationById = async (id) => {
  return await prisma.sellerApplication.findUnique({
    where: { id: Number(id) }
  });
};

const getApplicationByUserId = async (userId) => {
  return await prisma.sellerApplication.findFirst({
    where: { userId: Number(userId) },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const updateApplicationStatus = async (id, status, prismaTransaction = prisma) => {
  return await prismaTransaction.sellerApplication.update({
    where: { id: Number(id) },
    data: { status }
  });
};

const createStore = async (data, prismaTransaction = prisma) => {
  return await prismaTransaction.store.create({
    data
  });
};

const updateUserRole = async (userId, role, prismaTransaction = prisma) => {
  return await prismaTransaction.user.update({
    where: { id: Number(userId) },
    data: { role }
  });
};

const getRoleByName = async (roleName) => {
  return await prisma.role.findFirst({
    where: { nameRole: roleName }
  });
};

const addUserRoleMap = async (userId, roleId, prismaTransaction = prisma) => {
  const existing = await prismaTransaction.userRoleMap.findUnique({
    where: {
      userId_roleId: {
        userId: Number(userId),
        roleId: Number(roleId)
      }
    }
  });
  if (!existing) {
    return await prismaTransaction.userRoleMap.create({
      data: {
        userId: Number(userId),
        roleId: Number(roleId)
      }
    });
  }
  return existing;
};

const $transaction = async (callback) => {
  return await prisma.$transaction(callback);
};

module.exports = {
  // From HEAD
  findByUserId,
  findAll,
  create,
  updateStatus,
  // From main
  createApplication,
  getApplications,
  getApplicationById,
  getApplicationByUserId,
  updateApplicationStatus,
  createStore,
  updateUserRole,
  getRoleByName,
  addUserRoleMap,
  $transaction,
};
