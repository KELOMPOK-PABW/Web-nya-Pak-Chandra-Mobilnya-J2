const prisma = require("../config/database")

const findProductById = async (productId) => {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      seller: {
        select: { id: true, full_name: true },
      },
    },
  });
};

const getAllProducts = async ({ skip, take }) => {
  return prisma.product.findMany({
    skip,
    take,
    include: {
      seller: {
        select: { id: true, full_name: true },
      },
    },
  });
};

const countProducts = async () => {
  return prisma.product.count();
};

module.exports = {
  findProductById,
  getAllProducts,
  countProducts,
};