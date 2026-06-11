const repository = require("../repository/sellerApplicationRepository");

// ---- apply from main (with pending-exists check) ----
const apply = async (userId, data) => {
  const existing = await repository.getApplicationByUserId(userId);
  if (existing && existing.status === 'pending') {
    throw new Error("Anda sudah memiliki pengajuan yang sedang diproses");
  }

  const applicationData = {
    userId,
    storeName: data.store_name,
    phone: data.phone || null,
    status: 'pending'
  };

  const app = await repository.createApplication(applicationData);
  return {
    id: app.id,
    store_name: app.storeName,
    phone: app.phone,
    status: app.status,
    created_at: app.createdAt
  };
};

// ---- getMyApplication from HEAD (returns user's own app with all fields) ----
const getMyApplication = async (userId) => {
  const app = await repository.findByUserId(userId);
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

// ---- getApplications from HEAD (admin: all apps with owner info) ----
const getApplications = async () => {
  const apps = await repository.findAll();
  return apps.map((app) => ({
    id: app.id,
    userId: app.userId,
    ownerName: app.user?.fullName || "-",
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

// ---- approve from main (with transactional store + role creation) ----
const approve = async (id) => {
  const app = await repository.getApplicationById(id);
  if (!app) {
    throw new Error("Pengajuan tidak ditemukan");
  }
  if (app.status !== 'pending') {
    throw new Error(`Pengajuan sudah berstatus ${app.status}`);
  }

  await repository.$transaction(async (prisma) => {
    await repository.updateApplicationStatus(id, 'approved', prisma);

    await repository.createStore({
      userId: app.userId,
      storeName: app.storeName,
      phone: app.phone,
      isActive: true
    }, prisma);

    const sellerRole = await repository.getRoleByName('seller');
    if (sellerRole) {
      await repository.addUserRoleMap(app.userId, sellerRole.id, prisma);
    }
  });

  return { id: Number(id), status: "approved" };
};

// ---- reject from main (with existence + status validation) ----
const reject = async (id, reason) => {
  const app = await repository.getApplicationById(id);
  if (!app) {
    throw new Error("Pengajuan tidak ditemukan");
  }
  if (app.status !== 'pending') {
    throw new Error(`Pengajuan sudah berstatus ${app.status}`);
  }

  await repository.updateApplicationStatus(id, 'rejected');

  return { id: Number(id), status: "rejected" };
};

module.exports = {
  apply,
  getMyApplication,
  getApplications,
  approve,
  reject,
};
