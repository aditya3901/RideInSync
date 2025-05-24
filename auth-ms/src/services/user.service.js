const httpStatus = require("http-status");
const { User } = require("../models");
const ApiError = require("../utils/ApiError");
const constants = require("../constants");
const tokenService = require("./token.service");

/**
 * Generate auth tokens for user
 * @param {Object} user - User object
 * @returns {Object} Auth tokens
 */
const generateAuthTokens = (user) => {
  return tokenService.generateAuthTokens(user, constants.roles.USER);
};

/**
 * Register a new user
 * @param {Object} userBody - User data
 * @returns {Promise<User>}
 */
const registerUser = async (userBody) => {
  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ mobile: userBody.mobile }, { email: userBody.email }],
  });

  if (existingUser) {
    throw new ApiError(
      "User already exists with this mobile or email",
      httpStatus.BAD_REQUEST
    );
  }

  // Create new user
  return User.create({
    name: userBody.name,
    email: userBody.email,
    mobile: userBody.mobile,
    company: userBody.company_id,
    device_id: userBody.deviceID,
    device_type: userBody.deviceType,
    device_token: userBody.deviceToken,
  });
};

/**
 * Login with email
 * @param {string} email - User email
 * @param {Object} deviceInfo - Device information
 * @returns {Promise<User>}
 */
const loginUserWithEmail = async (email, deviceInfo) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError("User not found", httpStatus.NOT_FOUND);
  }

  // Update device info
  user.device_id = deviceInfo.deviceID;
  user.device_type = deviceInfo.deviceType;
  user.device_token = deviceInfo.deviceToken;
  await user.save();

  return user;
};

/**
 * Logout user
 * @param {Object} user - User object
 * @returns {Promise<User>}
 */
const logoutUser = async (user) => {
  user.device_id = null;
  user.device_type = null;
  user.device_token = null;
  return user.save();
};

/**
 * Set user address
 * @param {Object} user - User object
 * @param {Object} location - Location data
 * @returns {Promise<User>}
 */
const setUserAddress = async (user, location) => {
  if (!Object.values(constants.addressTypes).includes(location.type)) {
    throw new ApiError(
      "Invalid address type. Must be 'primary' or 'secondary'",
      httpStatus.BAD_REQUEST
    );
  }

  user[`${location.type}_address`] = {
    type: "Point",
    place_id: location.place_id,
    address: location.address,
    landmark: location.landmark ?? "",
    coordinates: [location.lng, location.lat], // For Geospactial Query, store in [long, lat] format
  };

  return user.save();
};

/**
 * Get user by ID
 * @param {ObjectId} id - User ID
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

module.exports = {
  generateAuthTokens,
  registerUser,
  loginUserWithEmail,
  logoutUser,
  setUserAddress,
  getUserById,
};
