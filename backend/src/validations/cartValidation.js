const Joi = require("joi");

const addCartItemSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  qty: Joi.number().integer().positive().required(),
});

module.exports = {
  addCartItemSchema,
};