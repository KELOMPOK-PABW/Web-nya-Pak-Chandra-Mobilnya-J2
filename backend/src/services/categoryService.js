const categoryRepository = require("../repository/categoryRepository");

const getAllCategories = async () => {
  const categories = await categoryRepository.findAll();
  return categories.map(formatCategoryResponse);
};

const getCategoryById = async (id) => {
  if (!id || isNaN(id)) {
    throw new Error("Category ID tidak valid");
  }

  const category = await categoryRepository.findById(Number(id));
  if (!category) {
    throw new Error("Kategori tidak ditemukan");
  }

  return formatCategoryResponse(category);
};

const createCategory = async (data) => {
  const { category_name } = data;

  const existing = await categoryRepository.findByName(category_name);
  if (existing) {
    throw new Error("Kategori dengan nama tersebut sudah ada");
  }

  const category = await categoryRepository.create({ name: category_name });
  return formatCategoryResponse(category);
};

const updateCategory = async (id, data) => {
  if (!id || isNaN(id)) {
    throw new Error("Category ID tidak valid");
  }

  const existing = await categoryRepository.findById(Number(id));
  if (!existing) {
    throw new Error("Kategori tidak ditemukan");
  }

  const { category_name } = data;

  if (category_name && category_name !== existing.name) {
    const duplicate = await categoryRepository.findByName(category_name);
    if (duplicate) {
      throw new Error("Kategori dengan nama tersebut sudah ada");
    }
  }

  const category = await categoryRepository.update(Number(id), { name: category_name });
  return formatCategoryResponse(category);
};

const formatCategoryResponse = (category) => {
  return {
    id: category.id,
    category_name: category.name,
  };
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
};
