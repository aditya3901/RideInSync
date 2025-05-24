const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const config = require("../../config/env.config");
const logger = require("../../config/logger");

/**
 * Authentication middleware to protect routes
 * Validates JWT token and attaches user info to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from authorization header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new ApiError(
          "Authentication required. Please log in.",
          httpStatus.UNAUTHORIZED
        )
      );
    }

    // Verify token
    try {
      const decoded = await promisify(jwt.verify)(token, config.jwt.secret);

      // Attach user data to request
      req.user = decoded;
      req.token = token; // Keep token for downstream service calls

      logger.debug(`Authenticated user: ${decoded.id}`);
      next();
    } catch (error) {
      logger.error("Token verification failed:", error);
      return next(
        new ApiError("Invalid or expired token", httpStatus.UNAUTHORIZED)
      );
    }
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
