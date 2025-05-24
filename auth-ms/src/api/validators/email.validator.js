const Joi = require("joi");

/**
 * Validation schemas for email-related operations
 */
const emailValidation = {
  /**
   * Schema for email verification
   */
  verifyEmail: {
    body: Joi.object().keys({
      email: Joi.string().email().required().trim(),
    }),
  },
};

module.exports = emailValidation;
