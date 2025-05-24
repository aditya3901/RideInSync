const httpStatus = require("http-status");
const { Driver } = require("../models");
const ApiError = require("../utils/ApiError");
const constants = require("../constants");
const tokenService = require("./token.service");

/**
 * Generate auth tokens for driver
 * @param {Object} driver - Driver object
 * @returns {Object} Auth tokens
 */
const generateAuthTokens = (driver) => {
  return tokenService.generateAuthTokens(driver, constants.roles.DRIVER);
};

/**
 * Register a new driver
 * @param {Object} driverBody - Driver data
 * @returns {Promise<Driver>}
 */
const registerDriver = async (driverBody) => {
  // Check if driver already exists
  const existingDriver = await Driver.findOne({
    $or: [{ mobile: driverBody.mobile }, { email: driverBody.email }],
  });

  if (existingDriver) {
    throw new ApiError(
      "Driver already exists with this mobile or email",
      httpStatus.BAD_REQUEST
    );
  }

  // Create new driver
  return Driver.create({
    name: driverBody.name,
    email: driverBody.email,
    mobile: driverBody.mobile,
    vehicle_number: driverBody.vehicle_number,
    vehicle_model: driverBody.vehicle_model,
    device_id: driverBody.deviceID,
    device_type: driverBody.deviceType,
    device_token: driverBody.deviceToken,
  });
};

/**
 * Login with email
 * @param {string} email - Driver email
 * @param {Object} deviceInfo - Device information
 * @returns {Promise<Driver>}
 */
const loginDriverWithEmail = async (email, deviceInfo) => {
  const driver = await Driver.findOne({ email });
  if (!driver) {
    throw new ApiError("Driver not found", httpStatus.NOT_FOUND);
  }

  // Update device info
  driver.device_id = deviceInfo.deviceID;
  driver.device_type = deviceInfo.deviceType;
  driver.device_token = deviceInfo.deviceToken;
  await driver.save();

  return driver;
};

/**
 * Logout driver
 * @param {Object} driver - Driver object
 * @returns {Promise<Driver>}
 */
const logoutDriver = async (driver) => {
  driver.device_id = null;
  driver.device_type = null;
  driver.device_token = null;
  return driver.save();
};

/**
 * Get driver by ID
 * @param {ObjectId} id - Driver ID
 * @returns {Promise<Driver>}
 */
const getDriverById = async (id) => {
  return Driver.findById(id);
};

/**
 * Update driver online status
 * @param {Object} driver - Driver object
 * @param {boolean} status - Online status
 * @returns {Promise<Driver>}
 */
const updateDriverOnlineStatus = async (driver, status) => {
  driver.online = status;
  return driver.save();
};

/**
 * Update driver location
 * @param {Object} driver - Driver object
 * @param {Object} location - Location data
 * @returns {Promise<Driver>}
 */
const updateDriverLocation = async (driver, location) => {
  driver.location = {
    type: "Point",
    coordinates: [location.lng, location.lat],
  };
  return driver.save();
};

module.exports = {
  generateAuthTokens,
  registerDriver,
  loginDriverWithEmail,
  logoutDriver,
  getDriverById,
  updateDriverOnlineStatus,
  updateDriverLocation,
};
