const httpStatus = require("http-status");
const { User, Driver } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Verify email and check if it belongs to a user or driver
 * @param {string} email - Email to verify
 * @returns {Promise<Object>} User or driver information
 */
const verifyEmail = async (email) => {
  // Check if email belongs to a user
  const user = await User.findOne({ email });
  if (user) {
    return {
      type: "user",
      mobile: user.mobile,
    };
  }

  // Check if email belongs to a driver
  const driver = await Driver.findOne({ email });
  if (driver) {
    return {
      type: "driver",
      mobile: driver.mobile,
    };
  }

  // No user or driver found with this email
  throw new ApiError("No user found with this email", httpStatus.NOT_FOUND);
};

module.exports = {
  verifyEmail,
};
