const productRepository = require("../repository/productRepository");
const categoryRepository = require("../repository/categoryRepository");

const formatProductResponse = (product) => {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    stock_status: product.stockStatus,
    image_url: product.imageUrl,
    category: product.category
      ? { id: product.category.id, category_name: product.category.name }
      : null,
    store: product.seller
      ? {
          id: product.seller.id,
          store_name: product.seller.full_name,
        }
      : null,
  };
};

const formatProductByIdResponse = (product) => {
  return {
    id: product.id,
    name: product.name,
    desc: product.description,
    price: product.price,
    stock: product.stock,
    image_url: product.imageUrl,
    category: product.category
      ? { id: product.category.id, category_name: product.category.name }
      : null,
    store: product.seller
      ? {
          id: product.seller.id,
          store_name: product.seller.full_name,
        }
      : null,
  };
};

const getAllProducts = async ({ page = 1, limit = 10, categoryId, keyword, minPrice, maxPrice }) => {
  const skip = (page - 1) * limit;
  const take = limit;
  const filters = { categoryId, keyword, minPrice, maxPrice };

  const [products, totalItems] = await Promise.all([
    productRepository.getAllProducts({ skip, take, ...filters }),
    productRepository.countProducts(filters),
  ]);

  if (!products || products.length === 0) {
    throw new Error("Tidak ada produk yang ditemukan");
  }

  const totalPages = Math.ceil(totalItems / limit);

  return {
    products: products.map(formatProductResponse),
    meta: {
      page,
      limit,
      total_items: totalItems,
      total_pages: totalPages,
    },
  };
};

const getProductById = async (productId) => {
  if (!productId || isNaN(productId)) {
    throw new Error("Product ID tidak valid");
  }

  const product = await productRepository.findProductById(Number(productId));

  if (!product) {
    throw new Error("Produk tidak ditemukan");
  }

  return formatProductByIdResponse(product);
};

const createProduct = async (data, sellerId) => {
  const { name, desc, price, stock, image_url, category_id } = data;

  // Validate category exists
  if (category_id) {
    const category = await categoryRepository.findById(Number(category_id));
    if (!category) {
      throw new Error("Kategori tidak ditemukan");
    }
  }

  const productData = {
    name,
    description: desc || "",
    price: Number(price),
    stock: Number(stock),
    stockStatus: Number(stock) > 0 ? "tersedia" : "habis",
    imageUrl: image_url || "",
    sellerId: Number(sellerId),
  };

  if (category_id) {
    productData.categoryId = Number(category_id);
  }

  const product = await productRepository.createProduct(productData);
  return formatProductByIdResponse(product);
};

const updateProduct = async (productId, data, sellerId) => {
  const existingProduct = await productRepository.findProductById(Number(productId));
  if (!existingProduct) throw new Error("Produk tidak ditemukan");
  if (existingProduct.sellerId !== sellerId) throw new Error("Akses ditolak: bukan produk Anda");

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.desc !== undefined) updateData.description = data.desc;
  if (data.image_url !== undefined) updateData.imageUrl = data.image_url;
  if (data.stock !== undefined) {
    updateData.stock = Number(data.stock);
    updateData.stockStatus = updateData.stock > 0 ? "tersedia" : "habis";
  }
  if (data.price !== undefined) updateData.price = Number(data.price);
  if (data.category_id !== undefined) {
    const category = await categoryRepository.findById(Number(data.category_id));
    if (!category) throw new Error("Kategori tidak ditemukan");
    updateData.categoryId = Number(data.category_id);
  }

  const product = await productRepository.updateProduct(Number(productId), updateData);
  return formatProductByIdResponse(product);
};

const deleteProduct = async (productId, sellerId) => {
  const existingProduct = await productRepository.findProductById(Number(productId));
  if (!existingProduct) throw new Error("Produk tidak ditemukan");
  if (existingProduct.sellerId !== sellerId) throw new Error("Akses ditolak: bukan produk Anda");

  return await productRepository.deleteProduct(Number(productId));
};

const getProductsBySeller = async (sellerId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const take = limit;

  const [products, totalItems] = await Promise.all([
    productRepository.getProductsBySellerId(sellerId, { skip, take }),
    productRepository.countProductsBySellerId(sellerId),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    products: products.map(formatProductByIdResponse),
    meta: {
      page,
      limit,
      total_items: totalItems,
      total_pages: totalPages,
    },
  };
};

module.exports = {
  formatProductResponse,
  formatProductByIdResponse,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
};