const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "any.required": "Nama produk wajib diisi",
    "string.empty": "Nama produk wajib diisi",
    "string.min": "Nama minimal 3 karakter",
    "string.max": "Nama maksimal 100 karakter",
  }),
  desc: Joi.string().max(1000).allow("", null).messages({
    "string.max": "Deskripsi terlalu panjang",
  }),
  price: Joi.number().required().min(0).messages({
    "any.required": "Harga wajib diisi",
    "number.base": "Harga harus angka",
    "number.min": "Harga tidak boleh negatif",
  }),
  stock: Joi.number().integer().required().min(0).messages({
    "any.required": "Stok wajib diisi",
    "number.base": "Stok harus angka",
    "number.integer": "Stok harus bilangan bulat",
    "number.min": "Stok tidak boleh negatif",
  }),
  category_id: Joi.number().integer().positive().required().messages({
    "any.required": "Kategori wajib diisi",
    "number.base": "Category ID harus angka",
  }),
  image_url: Joi.string().uri().allow("", null).messages({
    "string.uri": "URL gambar tidak valid",
  }),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).messages({
    "string.min": "Nama minimal 3 karakter",
    "string.max": "Nama maksimal 100 karakter",
  }),
  desc: Joi.string().max(1000).allow("", null).messages({
    "string.max": "Deskripsi terlalu panjang",
  }),
  price: Joi.number().min(0).messages({
    "number.base": "Harga harus angka",
    "number.min": "Harga tidak boleh negatif",
  }),
  stock: Joi.number().integer().min(0).messages({
    "number.base": "Stok harus angka",
    "number.integer": "Stok harus bilangan bulat",
    "number.min": "Stok tidak boleh negatif",
  }),
  category_id: Joi.number().integer().positive().messages({
    "number.base": "Category ID harus angka",
  }),
  image_url: Joi.string().uri().allow("", null).messages({
    "string.uri": "URL gambar tidak valid",
  }),
}).min(1).messages({
  "object.min": "Minimal satu field harus diisi untuk update",
});

module.exports = {
  createProductSchema,
  updateProductSchema,
};
