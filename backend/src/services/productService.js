const productRepository = require("../repository/productRepository");

const formatProductResponse = (product) => {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    stock_status: product.stockStatus,
    image_url: product.imageUrl,
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
    store: product.seller
      ? {
          id: product.seller.id,
          store_name: product.seller.full_name,
        }
      : null,
  };
};

const getAllProducts = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const take = limit;

  const [products, totalItems] = await Promise.all([
    productRepository.getAllProducts({ skip, take }),
    productRepository.countProducts(),
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

module.exports = {
  formatProductResponse,
  formatProductByIdResponse,
  getAllProducts,
  getProductById,
};