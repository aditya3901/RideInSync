const mongoose = require("mongoose");
const httpStatus = require("http-status");
const logger = require("../../config/logger");
const ApiError = require("../../utils/ApiError");
const config = require("../../config/env.config");

/**
 * Convert error to ApiError if needed
 * @param {Error} err - Error object
 * @returns {ApiError}
 */
const convertToApiError = (err) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;

    const message = error.message || httpStatus[statusCode];
    error = new ApiError(message, statusCode, false, err.stack);
  }

  return error;
};

/**
 * Handle specific error types and convert to appropriate response
 * @param {Error} err - Error object
 * @returns {ApiError}
 */
const handleSpecificErrors = (err) => {
  let error = err;

  if (err.name === "CastError") {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new ApiError(message, httpStatus.BAD_REQUEST);
  } else if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new ApiError(message, httpStatus.BAD_REQUEST);
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered for ${field}. Please use another value.`;
    error = new ApiError(message, httpStatus.BAD_REQUEST);
  } else if (err.name === "JsonWebTokenError") {
    error = new ApiError(
      "Invalid token. Please log in again.",
      httpStatus.UNAUTHORIZED
    );
  } else if (err.name === "TokenExpiredError") {
    error = new ApiError(
      "Token expired. Please log in again.",
      httpStatus.UNAUTHORIZED
    );
  }

  return error;
};

/**
 * Global error handler middleware
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = handleSpecificErrors(err);
  error = convertToApiError(error);

  if (!error.isOperational) {
    logger.error(error);
  }

  const response = {
    status: error.status,
    message: error.message,
    ...(config.env === "development" && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
