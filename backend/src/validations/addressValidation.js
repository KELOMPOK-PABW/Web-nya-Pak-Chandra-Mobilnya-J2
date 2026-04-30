const Joi = require("joi");

const addressSchema = Joi.object({
  address: Joi.string().required(),
  city: Joi.string().required(),
  postal_code: Joi.string().required(),
});

module.exports = {
  addressSchema,
};
