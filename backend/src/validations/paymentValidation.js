const Joi = require("joi");

const createPaymentSchema = Joi.object({
  order_id: Joi.number().integer().positive().required(),
});

module.exports = {
  createPaymentSchema,
};
