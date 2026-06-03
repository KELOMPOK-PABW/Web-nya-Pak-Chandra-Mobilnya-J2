const categoryService = require("../services/categoryService");
const { createCategorySchema, updateCategorySchema } = require("../validations/categoryValidation");

const getAllCategories = async (req, res) => {
  try {
    const result = await categoryService.getAllCategories();
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await categoryService.getCategoryById(id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode = error.message === "Kategori tidak ditemukan" ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { error, value } = createCategorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await categoryService.createCategory(value);
    return res.status(201).json({
      success: true,
      message: "Kategori berhasil dibuat",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateCategorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await categoryService.updateCategory(id, value);
    return res.status(200).json({
      success: true,
      message: "Kategori berhasil diperbarui",
      data: result,
    });
  } catch (error) {
    const statusCode = error.message === "Kategori tidak ditemukan" ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await categoryService.deleteCategory(id);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const statusCode = error.message === "Kategori tidak ditemukan" ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
