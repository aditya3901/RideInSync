const mongoose = require("mongoose");
const httpStatus = require("http-status");
const config = require("../../config/env.config");
const logger = require("../../config/logger");
const ApiError = require("../../utils/ApiError");

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
 * Convert error object to ApiError
 * @param {Error} err
 * @returns {ApiError}
 */
const convertToApiError = (err) => {
  if (!(err instanceof ApiError)) {
    // First check for specific error types
    err = handleSpecificErrors(err);

    // If still not an ApiError, create a generic one
    if (!(err instanceof ApiError)) {
      const statusCode =
        err.statusCode || err instanceof mongoose.Error
          ? httpStatus.BAD_REQUEST
          : httpStatus.INTERNAL_SERVER_ERROR;
      const message = err.message || httpStatus[statusCode];
      err = new ApiError(message, statusCode, false, err.stack);
    }
  }
  return err;
};

/**
 * Global error handler
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = convertToApiError(err);

  if (config.env === "production" && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  const response = {
    status: "error",
    statusCode,
    message,
    ...(config.env === "development" && { stack: err.stack }),
  };

  if (config.env === "development") {
    logger.error(err);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
