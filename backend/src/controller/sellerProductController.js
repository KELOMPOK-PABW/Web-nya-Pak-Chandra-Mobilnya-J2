const productService = require("../services/productService");
const { createProductSchema, updateProductSchema } = require("../validations/productValidation");

const getMyProducts = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await productService.getProductsBySeller(sellerId, { page, limit });
    return res.status(200).json({ success: true, data: result.products, meta: result.meta });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { error, value } = createProductSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const sellerId = req.user.id;
    const result = await productService.createProduct(value, sellerId);
    return res.status(201).json({
      message: "Produk berhasil ditambahkan",
      data: {
        id: result.id,
        name: result.name,
        stock_status: result.stock > 0 ? "stok tersedia" : "stok kosong",
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { error, value } = updateProductSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const sellerId = req.user.id;
    const { id } = req.params;
    const result = await productService.updateProduct(id, value, sellerId);
    return res.status(200).json({
      message: "Produk berhasil diperbarui",
      data: {
        id: result.id,
        stock: result.stock,
        stock_status: result.stock > 0 ? "stok tersedia" : "stok kosong",
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { id } = req.params;
    await productService.deleteProduct(id, sellerId);
    return res.status(200).json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getMyProducts, createProduct, updateProduct, deleteProduct };