const Joi = require("joi");

/**
 * Validation schemas for document-related operations
 */
const docsValidation = {
  /**
   * Schema for adding required document
   */
  addRequiredDoc: {
    body: Joi.object().keys({
      name: Joi.string().required().trim(),
      required: Joi.boolean().default(true),
      description: Joi.string().required().trim(),
    }),
  },

  /**
   * Schema for uploading document
   */
  uploadDoc: {
    body: Joi.object().keys({
      file: Joi.string().required().trim(),
      doc_id: Joi.string().required().trim(),
    }),
  },
};

module.exports = docsValidation;
