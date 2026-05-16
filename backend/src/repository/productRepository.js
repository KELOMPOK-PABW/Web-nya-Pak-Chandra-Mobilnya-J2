const prisma = require("../config/database")

const findProductById = async (productId) => {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      seller: {
        select: { id: true, full_name: true },
      },
      category: {
        select: { id: true, name: true },
      },
    },
  });
};

const getAllProducts = async ({ skip, take, categoryId, keyword, minPrice, maxPrice }) => {
  const where = {};

  if (categoryId) {
    where.categoryId = Number(categoryId);
  }
  if (keyword) {
    where.name = { contains: keyword };
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = Number(minPrice);
    if (maxPrice !== undefined) where.price.lte = Number(maxPrice);
  }

  return prisma.product.findMany({
    skip,
    take,
    where,
    include: {
      seller: {
        select: { id: true, full_name: true },
      },
      category: {
        select: { id: true, name: true },
      },
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
      seller: {
        select: { id: true, full_name: true },
      },
      category: {
        select: { id: true, name: true },
      },
    },
  });
};

const updateProduct = async (productId, data) => {
  return prisma.product.update({
    where: { id: productId },
    data,
    include: {
      seller: {
        select: { id: true, full_name: true },
      },
      category: {
        select: { id: true, name: true },
      },
    },
  });
};

const deleteProduct = async (productId) => {
  return prisma.product.delete({
    where: { id: productId },
  });
};

const getProductsBySellerId = async (sellerId, { skip, take }) => {
  return prisma.product.findMany({
    where: { sellerId },
    skip,
    take,
    include: {
      category: {
        select: { id: true, name: true },
      },
    },
  });
};

const countProductsBySellerId = async (sellerId) => {
  return prisma.product.count({
    where: { sellerId },
  });
};

module.exports = {
  findProductById,
  getAllProducts,
  countProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsBySellerId,
  countProductsBySellerId,
};