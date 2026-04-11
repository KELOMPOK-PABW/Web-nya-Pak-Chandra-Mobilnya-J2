const Joi = require("joi");

const addCartItemSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  qty: Joi.number().integer().positive().required(),
});

const updateCartItemSchema = Joi.object({
  user_id: Joi.number().integer().required().messages({
    "any.required": "user_id is required",
    "number.base": "user_id must be a number",
    "number.integer": "user_id must be an integer",
  }),
  qty: Joi.number().integer().min(1).required().messages({
    "any.required": "qty is required",
    "number.base": "qty must be a number",
    "number.integer": "qty must be an integer",
    "number.min": "qty must be at least 1",
  }),
});

const deleteCartItemSchema = Joi.object({
  user_id: Joi.number().integer().required().messages({
    "any.required": "user_id is required",
    "number.base": "user_id must be a number",
    "number.integer": "user_id must be an integer",
  }),
});

const clearCartSchema = Joi.object({
  user_id: Joi.number().integer().required().messages({
    "any.required": "user_id is required",
    "number.base": "user_id must be a number",
    "number.integer": "user_id must be an integer",
  }),
});

module.exports = {
  addCartItemSchema,
  updateCartItemSchema,
  deleteCartItemSchema,
  clearCartSchema,
};