const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const { User, Driver } = require("../../models");
const { tokenService } = require("../../services");
const logger = require("../../config/logger");

const auth = () => async (req, res, next) => {
  try {
    // 1) Get token and check if it exists
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
          "You are not logged in! Please log in to get access.",
          httpStatus.UNAUTHORIZED
        )
      );
    }

    // 2) Verify token
    const decoded = await tokenService.verifyToken(token);

    // 3) Check if user still exists
    let currentUser;

    // Check if it's a user or driver based on the route or token role
    if (req.originalUrl.includes("/user") || decoded.role === "user") {
      currentUser = await User.findById(decoded.id);
    } else if (
      req.originalUrl.includes("/driver") ||
      decoded.role === "driver"
    ) {
      currentUser = await Driver.findById(decoded.id);
    }

    if (!currentUser) {
      return next(
        new ApiError(
          "The user belonging to this token no longer exists.",
          httpStatus.UNAUTHORIZED
        )
      );
    }

    // Grant access to protected route
    req.user = currentUser;
    req.token = decoded;
    next();
  } catch (err) {
    logger.error("Auth middleware error:", err);
    next(
      new ApiError(
        "Invalid token. Please log in again.",
        httpStatus.UNAUTHORIZED
      )
    );
  }
};

module.exports = auth;
