const sellerApplicationRepository = require("../repository/sellerApplicationRepository");

const apply = async (userId, data) => {
  const existing = await sellerApplicationRepository.findByUserId(userId);
  if (existing) throw new Error("Anda sudah memiliki pengajuan seller");

  return sellerApplicationRepository.create({
    userId: Number(userId),
    storeName: data.store_name,
    phone: data.phone || null,
    address: data.address || null,
    city: data.city || null,
    status: "pending",
  });
};

const getMyApplication = async (userId) => {
  const app = await sellerApplicationRepository.findByUserId(userId);
  if (!app) return null;

  return {
    id: app.id,
    storeName: app.storeName,
    phone: app.phone,
    address: app.address,
    city: app.city,
    status: app.status,
    reviewerNote: app.reviewerNote,
    submittedAt: app.createdAt,
    reviewedAt: app.reviewedAt,
  };
};

const getAllApplications = async () => {
  const apps = await sellerApplicationRepository.findAll();
  return apps.map((app) => ({
    id: app.id,
    userId: app.userId,
    ownerName: app.user?.full_name || "-",
    email: app.user?.email || "-",
    storeName: app.storeName,
    phone: app.phone,
    address: app.address,
    city: app.city,
    status: app.status,
    reviewerNote: app.reviewerNote,
    submittedAt: app.createdAt,
    reviewedAt: app.reviewedAt,
  }));
};

const approveApplication = async (id) => {
  const app = await sellerApplicationRepository.updateStatus(Number(id), "approved", null);

  // Update user role to seller
  const prisma = require("../config/database");
  await prisma.user.update({
    where: { id: app.userId },
    data: { role: "seller" },
  });

  return { id: app.id, status: app.status };
};

const rejectApplication = async (id, reason) => {
  const app = await sellerApplicationRepository.updateStatus(Number(id), "rejected", reason);
  return { id: app.id, status: app.status, reason };
};

module.exports = {
  apply,
  getMyApplication,
  getAllApplications,
  approveApplication,
  rejectApplication,
};
