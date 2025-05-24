const Joi = require("joi");

/**
 * Validation schemas for user-related operations
 */
const userValidation = {
  /**
   * Schema for user registration
   */
  register: {
    body: Joi.object().keys({
      name: Joi.string().required().trim(),
      email: Joi.string().email().required().trim(),
      mobile: Joi.string()
        .pattern(/^\+[1-9]\d{1,14}$/)
        .required()
        .messages({
          "string.pattern.base":
            "Mobile number must be in international format (e.g., +919876543210)",
        }),
      company_id: Joi.string().optional(),
      deviceID: Joi.string().optional(),
      deviceType: Joi.string().optional(),
      deviceToken: Joi.string().optional(),
    }),
  },

  /**
   * Schema for user login
   */
  login: {
    body: Joi.object().keys({
      email: Joi.string().email().required().trim(),
      deviceID: Joi.string().optional(),
      deviceType: Joi.string().optional(),
      deviceToken: Joi.string().optional(),
    }),
  },

  /**
   * Schema for setting user address
   */
  setAddress: {
    body: Joi.object().keys({
      type: Joi.string().valid("primary", "secondary").required(),
      place_id: Joi.string().required(),
      address: Joi.string().required(),
      landmark: Joi.string().optional(),
      lat: Joi.number().required(),
      lng: Joi.number().required(),
    }),
  },

  /**
   * Schema for getting user address
   */
  getAddress: {
    query: Joi.object().keys({
      type: Joi.string().valid("primary", "secondary").required(),
    }),
  },
};

module.exports = userValidation;
