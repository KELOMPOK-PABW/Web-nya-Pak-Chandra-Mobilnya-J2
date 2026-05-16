const Joi = require("joi");

const createReviewSchema = Joi.object({
  order_item_id: Joi.number().integer().positive().required().messages({
    "any.required": "Order item ID wajib diisi",
    "number.base": "Order item ID harus berupa angka",
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    "any.required": "Rating wajib diisi",
    "number.base": "Rating tidak valid",
    "number.integer": "Rating tidak valid",
    "number.min": "Rating harus 1-5",
    "number.max": "Rating harus 1-5",
  }),
  comment: Joi.string().max(1000).allow("", null).messages({
    "string.max": "Komentar terlalu panjang",
  }),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).messages({
    "number.base": "Rating tidak valid",
    "number.integer": "Rating tidak valid",
    "number.min": "Rating harus 1-5",
    "number.max": "Rating harus 1-5",
  }),
  comment: Joi.string().max(1000).allow("", null).messages({
    "string.max": "Komentar terlalu panjang",
  }),
}).min(1).messages({
  "object.min": "Minimal satu field harus diisi untuk update",
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
};
