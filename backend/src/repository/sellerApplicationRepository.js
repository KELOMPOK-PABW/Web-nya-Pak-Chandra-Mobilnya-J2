const prisma = require("../config/database");

const findByUserId = async (userId) => {
  return prisma.sellerApplication.findUnique({
    where: { userId: Number(userId) },
  });
};

const findAll = async () => {
  return prisma.sellerApplication.findMany({
    include: {
      user: { select: { full_name: true, email: true } },
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

module.exports = {
  findByUserId,
  findAll,
  create,
  updateStatus,
};
