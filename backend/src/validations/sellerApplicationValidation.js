const Joi = require("joi");

const sellerApplicationSchema = Joi.object({
  store_name: Joi.string().min(3).required().messages({
    "string.empty": "Nama toko tidak boleh kosong",
    "string.min": "Nama toko minimal 3 karakter",
    "any.required": "Nama toko wajib diisi",
  }),
  phone: Joi.string().pattern(/^[0-9]+$/).min(10).required().messages({
    "string.empty": "Nomor telepon tidak boleh kosong",
    "string.pattern.base": "Nomor telepon hanya boleh berisi angka",
    "string.min": "Nomor telepon minimal 10 digit",
    "any.required": "Nomor telepon wajib diisi",
  })
});

module.exports = {
  sellerApplicationSchema
};
