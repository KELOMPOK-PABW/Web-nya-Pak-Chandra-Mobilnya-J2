const productService = require("../services/productService");

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const categoryId = req.query.category_id || null;
    const keyword = req.query.keyword || null;
    const minPrice = req.query.min_price !== undefined ? Number(req.query.min_price) : undefined;
    const maxPrice = req.query.max_price !== undefined ? Number(req.query.max_price) : undefined;

    const result = await productService.getAllProducts({ page, limit, categoryId, keyword, minPrice, maxPrice });

    return res.status(200).json({
      success: true,
      data: result.products,
      meta: result.meta,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await productService.getProductById(id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
};
