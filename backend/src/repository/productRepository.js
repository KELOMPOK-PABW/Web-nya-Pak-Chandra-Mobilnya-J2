const prisma = require("../config/database")
const { expandKeywords } = require("../utils/synonyms")

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

/**
 * Build a Prisma WHERE clause for keyword(s) search.
 * - Single `keyword`: searches `name` only (backward compat with productService).
 * - Multi `keywords` array: searches `name` AND `desc` with OR across all keywords
 *   AND their synonyms, catching products no matter which term variant the user typed
 *   (e.g. "notebook" expands to "laptop/notebook/ultrabook/chromebook").
 */
/**
 * Build the OR conditions for a list of expanded search terms.
 * Searches name, description, AND category name so products like
 * "MacBook Pro" (in the "Laptop" category) match a "laptop" query.
 */
const buildTermConditions = (terms) =>
  terms.flatMap((term) => [
    { name: { contains: term } },
    { desc: { contains: term } },
    { category: { categoryName: { contains: term } } },
  ]);

const buildKeywordWhere = (keyword, keywords) => {
  if (keywords && Array.isArray(keywords) && keywords.length >= 2) {
    const expanded = expandKeywords(keywords);
    return { OR: buildTermConditions(expanded) };
  }
  if (keywords && Array.isArray(keywords) && keywords.length === 1) {
    const expanded = expandKeywords(keywords);
    if (expanded.length >= 2) {
      return { OR: buildTermConditions(expanded) };
    }
    return { OR: buildTermConditions(expanded) };
  }
  if (keyword) {
    return { name: { contains: keyword } };
  }
  return {};
};

const getAllProducts = async ({ skip, take, categoryId, keyword, keywords, minPrice, maxPrice }) => {
  const where = { ...buildKeywordWhere(keyword, keywords) };
  if (categoryId) where.categoryId = Number(categoryId);
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

const countProducts = async ({ categoryId, keyword, keywords, minPrice, maxPrice } = {}) => {
  const where = { ...buildKeywordWhere(keyword, keywords) };
  if (categoryId) where.categoryId = Number(categoryId);
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
