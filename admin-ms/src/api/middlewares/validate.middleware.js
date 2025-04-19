const Joi = require("joi");
const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const logger = require("../../config/logger");

/**
 * Create validation middleware for a specific schema
 * @param {Object} schema - Validation schema object with request parts as keys
 * @returns {Function} Express middleware function
 */
const validate = (schema) => (req, res, next) => {
  const validSchema = pickSchema(schema, ["params", "query", "body"]);
  const object = pickRequestData(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");

    logger.warn(`Validation error: ${errorMessage}`);
    return next(new ApiError(errorMessage, httpStatus.BAD_REQUEST));
  }

  // Replace request data with validated data
  Object.assign(req, value);

  return next();
};

/**
 * Pick only the defined validation schema properties
 * @param {Object} object - Object to pick properties from
 * @param {string[]} keys - Properties to pick
 * @returns {Object} Object with picked properties
 */
const pickSchema = (object, keys) => {
  return keys.reduce((schema, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      schema[key] = object[key];
    }
    return schema;
  }, {});
};

/**
 * Pick request data to validate
 * @param {Object} req - Express request object
 * @param {string[]} keys - Request parts to pick (params, query, body)
 * @returns {Object} Request data to validate
 */
const pickRequestData = (req, keys) => {
  return keys.reduce((requestData, key) => {
    if (key === "body") {
      requestData[key] = req.body;
    } else if (key === "params") {
      requestData[key] = req.params;
    } else if (key === "query") {
      requestData[key] = req.query;
    }
    return requestData;
  }, {});
};

module.exports = validate;
