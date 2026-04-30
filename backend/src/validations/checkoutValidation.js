const Joi = require("joi");

const checkoutSchema = Joi.object({
  cart_id: Joi.number().integer().positive().required(),
  address_id: Joi.number().integer().positive().required(),
  payment_method: Joi.string().valid("ewallet").required(),
});

module.exports = {
  checkoutSchema,
};