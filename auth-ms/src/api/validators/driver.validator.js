const Joi = require("joi");

/**
 * Validation schemas for driver-related operations
 */
const driverValidation = {
  /**
   * Schema for driver registration
   */
  register: {
    body: Joi.object().keys({
      name: Joi.string().required().trim(),
      email: Joi.string().email().required().trim(),
      mobile: Joi.string()
        .pattern(/^\d{10}$/)
        .required()
        .messages({
          "string.pattern.base": "Mobile number must be 10 digits",
        }),
      vehicle_number: Joi.string().required().trim(),
      vehicle_model: Joi.string().required().trim(),
      deviceID: Joi.string().optional(),
      deviceType: Joi.string().optional(),
      deviceToken: Joi.string().optional(),
    }),
  },

  /**
   * Schema for driver login
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
   * Schema for updating driver online status
   */
  updateOnlineStatus: {
    body: Joi.object().keys({
      online: Joi.boolean().required(),
    }),
  },

  /**
   * Schema for updating driver location
   */
  updateLocation: {
    body: Joi.object().keys({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
    }),
  },
};

module.exports = driverValidation;
