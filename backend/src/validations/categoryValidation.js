const Joi = require("joi");

const createCategorySchema = Joi.object({
  category_name: Joi.string().min(2).max(100).required().messages({
    "any.required": "Nama kategori wajib diisi",
    "string.min": "Nama kategori minimal 2 karakter",
    "string.max": "Nama kategori maksimal 100 karakter",
  }),
});

const updateCategorySchema = Joi.object({
  category_name: Joi.string().min(2).max(100).required().messages({
    "any.required": "Nama kategori wajib diisi",
    "string.min": "Nama kategori minimal 2 karakter",
    "string.max": "Nama kategori maksimal 100 karakter",
  }),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
