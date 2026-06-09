const repository = require("../repository/sellerApplicationRepository");

const apply = async (userId, data) => {
  // Check if there is an existing pending application
  const existing = await repository.getApplicationByUserId(userId);
  if (existing && existing.status === 'pending') {
    throw new Error("Anda sudah memiliki pengajuan yang sedang diproses");
  }

  const applicationData = {
    userId,
    storeName: data.store_name,
    phone: data.phone,
    status: 'pending'
  };

  const app = await repository.createApplication(applicationData);
  return {
    id: app.id,
    user_id: app.userId,
    store_name: app.storeName,
    phone: app.phone,
    status: app.status,
    created_at: app.createdAt
  };
};

const getApplications = async () => {
  const apps = await repository.getApplications();
  return apps.map(app => ({
    id: app.id,
    store_name: app.storeName,
    phone: app.phone,
    status: app.status,
    created_at: app.createdAt
  }));
};

const approve = async (id) => {
  const app = await repository.getApplicationById(id);
  if (!app) {
    throw new Error("Pengajuan tidak ditemukan");
  }
  if (app.status !== 'pending') {
    throw new Error(`Pengajuan sudah berstatus ${app.status}`);
  }

  // Need to transactionally: 1. Update app status, 2. Create store, 3. Update user role
  await repository.$transaction(async (prisma) => {
    // 1. Update status
    await repository.updateApplicationStatus(id, 'approved', prisma);

    // 2. Create store
    await repository.createStore({
      userId: app.userId,
      storeName: app.storeName,
      phone: app.phone,
      isActive: true
    }, prisma);

    // 3. Update user role to seller
    await repository.updateUserRole(app.userId, 'seller', prisma);

    // 4. Also insert to user_roles mapping if Role exists
    const sellerRole = await repository.getRoleByName('seller');
    if (sellerRole) {
      await repository.addUserRoleMap(app.userId, sellerRole.id, prisma);
    }
  });

  return {
    id: Number(id),
    status: "approved"
  };
};

const reject = async (id, reason) => {
  const app = await repository.getApplicationById(id);
  if (!app) {
    throw new Error("Pengajuan tidak ditemukan");
  }
  if (app.status !== 'pending') {
    throw new Error(`Pengajuan sudah berstatus ${app.status}`);
  }

  // Status is updated to rejected. Reason is not saved in DB per schema but we can return it.
  await repository.updateApplicationStatus(id, 'rejected');

  return {
    id: Number(id),
    status: "rejected"
  };
};

module.exports = {
  apply,
  getApplications,
  approve,
  reject
};
