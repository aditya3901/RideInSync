/**
 * Custom Error class for API errors with HTTP status codes
 * @extends Error
 */
class ApiError extends Error {
  /**
   * Creates an API error.
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {boolean} isOperational - Whether this is an operational error that can be predicted
   * @param {string} stack - Error stack trace
   */
  constructor(message, statusCode, isOperational = true, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
