const Joi = require("joi");

const topupSchema = Joi.object({
  amount: Joi.number().integer().positive().required(),
});

const refundSchema = Joi.object({
  order_id: Joi.number().integer().positive().required(),
});

module.exports = {
  topupSchema,
  refundSchema,
};
