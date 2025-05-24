const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const { User } = require("../../models/user.model");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const config = require("../../config/env.config");
const { userService } = require("../../services");

/**
 * Create and send JWT token
 * @param {Object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 * @param {string} type - User type
 */
const createSendToken = (user, statusCode, res, type) => {
  const token = jwt.sign({ id: user._id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  res.status(statusCode).json({
    status: "success",
    type,
    token,
    user,
  });
};

/**
 * Register a new user
 * @POST /user/register
 */
const register = catchAsync(async (req, res) => {
  const user = await userService.registerUser(req.body);
  const tokens = userService.generateAuthTokens(user);

  res.status(httpStatus.CREATED).json({
    status: "success",
    type: "user",
    token: tokens.access.token,
    user,
  });
});

/**
 * Login user
 * @POST /user/login
 */
const login = catchAsync(async (req, res) => {
  const { email } = req.body;
  const deviceInfo = {
    deviceID: req.body.deviceID,
    deviceType: req.body.deviceType,
    deviceToken: req.body.deviceToken,
  };

  const user = await userService.loginUserWithEmail(email, deviceInfo);
  const tokens = userService.generateAuthTokens(user);

  res.status(httpStatus.OK).json({
    status: "success",
    type: "user",
    token: tokens.access.token,
    user,
  });
});

/**
 * Logout user
 * @POST /user/logout
 */
const logout = catchAsync(async (req, res) => {
  await userService.logoutUser(req.user);

  res.status(httpStatus.OK).json({
    status: "success",
    message: "Logged out successfully",
  });
});

/**
 * Get user details
 * @GET /user/details
 */
const getDetails = catchAsync(async (req, res) => {
  res.status(httpStatus.OK).json({
    status: "success",
    user: req.user,
  });
});

/**
 * Set user address
 * @POST /user/address
 */
const setUserAddress = catchAsync(async (req, res) => {
  await userService.setUserAddress(req.user, req.body);

  res.status(httpStatus.OK).json({
    status: "success",
    message: "Address updated successfully",
  });
});

/**
 * Get user address
 * @GET /user/address
 */
const getUserAddress = catchAsync(async (req, res) => {
  const { type } = req.query;

  if (!["primary", "secondary"].includes(type)) {
    throw new ApiError(
      "Invalid address type. Must be 'primary' or 'secondary'",
      httpStatus.BAD_REQUEST
    );
  }

  res.status(httpStatus.OK).json({
    status: "success",
    address: req.user[`${type}_address`],
  });
});

module.exports = {
  register,
  login,
  logout,
  getDetails,
  setUserAddress,
  getUserAddress,
};
