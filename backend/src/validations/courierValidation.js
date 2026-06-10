const Joi = require("joi");

const assignCourierSchema = Joi.object({
  order_item_id: Joi.number().integer().positive().required().messages({
    "any.required": "order_item_id wajib diisi",
    "number.base": "order_item_id harus angka",
    "number.integer": "order_item_id harus bilangan bulat",
    "number.positive": "order_item_id harus positif",
  }),
  kurir_id: Joi.number().integer().positive().required().messages({
    "any.required": "kurir_id wajib diisi",
    "number.base": "kurir_id harus angka",
    "number.integer": "kurir_id harus bilangan bulat",
    "number.positive": "kurir_id harus positif",
  }),
});

module.exports = {
  assignCourierSchema,
};
