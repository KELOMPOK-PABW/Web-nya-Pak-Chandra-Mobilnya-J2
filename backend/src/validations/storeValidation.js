const Joi = require("joi");

const updateStoreSchema = Joi.object({
  store_name: Joi.string().min(3).messages({
    "string.empty": "Nama toko tidak boleh kosong",
    "string.min": "Nama toko minimal 3 karakter",
  }),
  phone: Joi.string().pattern(/^[0-9]+$/).min(10).messages({
    "string.empty": "Nomor telepon tidak boleh kosong",
    "string.pattern.base": "Nomor telepon hanya boleh berisi angka",
    "string.min": "Nomor telepon minimal 10 digit",
  }),
}).min(1).messages({
  "object.min": "Minimal satu field harus diisi untuk memperbarui toko",
});

module.exports = {
  updateStoreSchema,
};
