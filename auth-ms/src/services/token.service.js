const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const httpStatus = require("http-status");
const config = require("../config/env.config");
const ApiError = require("../utils/ApiError");

/**
 * Generate JWT token
 * @param {ObjectId} userId - User ID
 * @param {string} [role='user'] - User role
 * @returns {string} JWT token
 */
const generateToken = (userId, role = "user") => {
  const payload = {
    id: userId,
    role,
    iat: moment().unix(),
  };
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token
 */
const verifyToken = async (token) => {
  try {
    const decoded = await promisify(jwt.verify)(token, config.jwt.secret);
    return decoded;
  } catch (error) {
    throw new ApiError("Invalid token", httpStatus.UNAUTHORIZED);
  }
};

/**
 * Generate auth tokens
 * @param {Object} user - User object
 * @param {string} role - User role
 * @returns {Object} Auth tokens
 */
const generateAuthTokens = (user, role) => {
  const accessToken = generateToken(user._id, role);
  return {
    access: {
      token: accessToken,
      expires: moment().add(config.jwt.expiresIn, "days").toDate(),
    },
  };
};

module.exports = {
  generateToken,
  verifyToken,
  generateAuthTokens,
};
