const prisma = require("../config/database")

const findProductById = async (productId) => {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      store: {
        include: {
          user: { select: { id: true, fullName: true } },
        },
      },
      category: { select: { id: true, categoryName: true } },
    },
  });
};

const getAllProducts = async ({ skip, take, categoryId, keyword, minPrice, maxPrice }) => {
  const where = {};
  if (categoryId) where.categoryId = Number(categoryId);
  if (keyword) where.name = { contains: keyword };
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = Number(minPrice);
    if (maxPrice !== undefined) where.price.lte = Number(maxPrice);
  }

  return prisma.product.findMany({
    skip, take, where,
    include: {
      store: {
        include: {
          user: { select: { id: true, fullName: true } },
        },
      },
      category: { select: { id: true, categoryName: true } },
    },
  });
};

const countProducts = async ({ categoryId, keyword, minPrice, maxPrice } = {}) => {
  const where = {};
  if (categoryId) where.categoryId = Number(categoryId);
  if (keyword) where.name = { contains: keyword };
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = Number(minPrice);
    if (maxPrice !== undefined) where.price.lte = Number(maxPrice);
  }
  return prisma.product.count({ where });
};

const createProduct = async (data) => {
  return prisma.product.create({
    data,
    include: {
      store: {
        include: {
          user: { select: { id: true, fullName: true } },
        },
      },
      category: { select: { id: true, categoryName: true } },
    },
  });
};

const updateProduct = async (productId, data) => {
  return prisma.product.update({
    where: { id: productId },
    data,
    include: {
      store: {
        include: {
          user: { select: { id: true, fullName: true } },
        },
      },
      category: { select: { id: true, categoryName: true } },
    },
  });
};

const deleteProduct = async (productId) => {
  return prisma.product.delete({ where: { id: productId } });
};

const findStoreByUserId = async (userId) => {
  return prisma.store.findUnique({ where: { userId: Number(userId) } });
};

const getProductsByStoreId = async (storeId, { skip, take }) => {
  return prisma.product.findMany({
    where: { storeId },
    skip, take,
    include: { category: { select: { id: true, categoryName: true } } },
  });
};

const countProductsByStoreId = async (storeId) => {
  return prisma.product.count({ where: { storeId } });
};

module.exports = {
  findProductById, getAllProducts, countProducts, createProduct,
  updateProduct, deleteProduct, findStoreByUserId,
  getProductsByStoreId, countProductsByStoreId,
};
