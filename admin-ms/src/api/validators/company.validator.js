const Joi = require("joi");

/**
 * Validation schemas for company-related operations
 */
const companyValidation = {
  /**
   * Schema for creating a new company
   */
  createCompany: {
    body: Joi.object().keys({
      name: Joi.string().required().trim(),
      email: Joi.string().email().required().trim(),
    }),
  },
};

module.exports = companyValidation;
