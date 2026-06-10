const productRepository = require("../repository/productRepository");
const categoryRepository = require("../repository/categoryRepository");
const AppError = require("../utils/AppError");

const formatProductResponse = (product) => {
  return {
    id: product.id,
    name: product.name,
    description: product.desc,
    price: product.price,
    stock: product.stock,
    stock_status: product.stockStatus,
    image_url: product.imageUrl,
    category: product.category
      ? { id: product.category.id, category_name: product.category.categoryName }
      : null,
    store: product.store
      ? {
          id: product.store.id,
          store_name: product.store.storeName,
          user: product.store.user
            ? { id: product.store.user.id, full_name: product.store.user.fullName }
            : null,
        }
      : null,
  };
};

const formatProductByIdResponse = (product) => {
  return {
    id: product.id,
    name: product.name,
    desc: product.desc,
    price: product.price,
    stock: product.stock,
    image_url: product.imageUrl,
    category: product.category
      ? { id: product.category.id, category_name: product.category.categoryName }
      : null,
    store: product.store
      ? {
          id: product.store.id,
          store_name: product.store.storeName,
        }
      : null,
  };
};

const getAllProducts = async ({ page = 1, limit = 10, categoryId, keyword, minPrice, maxPrice }) => {
  const skip = (page - 1) * limit;
  const take = limit;

  // Split multi-word search queries into individual tokens so "laptop apple"
  // searches for products matching "laptop" OR "apple" instead of the literal
  // substring "laptop apple" (which would miss "MacBook Apple Pro").
  const keywords = keyword
    ? keyword.split(/\s+/).filter(Boolean)
    : undefined;

  const [products, totalItems] = await Promise.all([
    productRepository.getAllProducts({ skip, take, categoryId, keyword, keywords, minPrice, maxPrice }),
    productRepository.countProducts({ categoryId, keyword, keywords, minPrice, maxPrice }),
  ]);

  if (!products || products.length === 0) {
    throw new Error("Tidak ada produk yang ditemukan");
  }

  return {
    products: products.map(formatProductResponse),
    meta: { page, limit, total_items: totalItems, total_pages: Math.ceil(totalItems / limit) },
  };
};

const getProductById = async (productId) => {
  if (!productId || isNaN(productId)) {
    throw new Error("Product ID tidak valid");
  }

  const product = await productRepository.findProductById(Number(productId));
  if (!product) {
    throw new AppError("Produk tidak ditemukan", 404);
  }

  return formatProductByIdResponse(product);
};

const createProduct = async (data, sellerId) => {
  const { name, desc, price, stock, image_url, category_id } = data;

  if (category_id) {
    const category = await categoryRepository.findById(Number(category_id));
    if (!category) throw new AppError("Kategori tidak ditemukan", 404);
  }

  const store = await productRepository.findStoreByUserId(sellerId);
  if (!store) throw new Error("Anda belum memiliki toko. Daftarkan toko terlebih dahulu.");

  const productData = {
    name,
    desc: desc || "",
    price: Number(price),
    stock: Number(stock),
    stockStatus: Number(stock) > 0 ? "tersedia" : "habis",
    imageUrl: image_url || "",
    storeId: store.id,
  };

  if (category_id) productData.categoryId = Number(category_id);

  const product = await productRepository.createProduct(productData);
  return formatProductByIdResponse(product);
};

const updateProduct = async (productId, data, sellerId) => {
  const existingProduct = await productRepository.findProductById(Number(productId));
  if (!existingProduct) throw new AppError("Produk tidak ditemukan", 404);

  const store = await productRepository.findStoreByUserId(sellerId);
  if (!store || existingProduct.storeId !== store.id) throw new AppError("Akses ditolak: bukan produk Anda", 403);

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.desc !== undefined) updateData.desc = data.desc;
  if (data.image_url !== undefined) updateData.imageUrl = data.image_url;
  if (data.stock !== undefined) {
    updateData.stock = Number(data.stock);
    updateData.stockStatus = updateData.stock > 0 ? "tersedia" : "habis";
  }
  if (data.price !== undefined) updateData.price = Number(data.price);
  if (data.category_id !== undefined) {
    const category = await categoryRepository.findById(Number(data.category_id));
    if (!category) throw new AppError("Kategori tidak ditemukan", 404);
    updateData.categoryId = Number(data.category_id);
  }

  const product = await productRepository.updateProduct(Number(productId), updateData);
  return formatProductByIdResponse(product);
};

const deleteProduct = async (productId, sellerId) => {
  const existingProduct = await productRepository.findProductById(Number(productId));
  if (!existingProduct) throw new AppError("Produk tidak ditemukan", 404);

  const store = await productRepository.findStoreByUserId(sellerId);
  if (!store || existingProduct.storeId !== store.id) throw new AppError("Akses ditolak: bukan produk Anda", 403);

  return await productRepository.deleteProduct(Number(productId));
};

const getProductsBySeller = async (sellerId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const take = limit;

  const store = await productRepository.findStoreByUserId(sellerId);
  if (!store) {
    return { products: [], meta: { page, limit, total_items: 0, total_pages: 0 } };
  }

  const [products, totalItems] = await Promise.all([
    productRepository.getProductsByStoreId(store.id, { skip, take }),
    productRepository.countProductsByStoreId(store.id),
  ]);

  return {
    products: products.map(formatProductByIdResponse),
    meta: { page, limit, total_items: totalItems, total_pages: Math.ceil(totalItems / limit) },
  };
};

module.exports = {
  formatProductResponse, formatProductByIdResponse,
  getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductsBySeller,
};
