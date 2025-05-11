const Joi = require("joi");

/**
 * Validation schemas for office-related operations
 */
const officeValidation = {
  /**
   * Schema for creating a new office
   */
  createOffice: {
    body: Joi.object().keys({
      company_id: Joi.string().required(),
      name: Joi.string().required().trim(),
      address: Joi.string().required().trim(),
      lat: Joi.number().required().min(-90).max(90),
      lng: Joi.number().required().min(-180).max(180),
      landmark: Joi.string().trim(),
      place_id: Joi.string().trim(),
    }),
  },

  /**
   * Schema for getting nearby offices
   */
  getNearbyOffices: {
    query: Joi.object().keys({
      company_id: Joi.string(),
      latitude: Joi.number().required().min(-90).max(90),
      longitude: Joi.number().required().min(-180).max(180),
      maxDistance: Joi.number().min(0).max(50000),
    }),
  },

  /**
   * Schema for getting office by ID
   */
  getOfficeById: {
    params: Joi.object().keys({
      officeId: Joi.string().required(),
    }),
  },
};

module.exports = officeValidation;
