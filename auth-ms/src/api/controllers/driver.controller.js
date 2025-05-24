const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const { driverService } = require("../../services");

/**
 * Register a new driver
 * @POST /driver/register
 */
const register = catchAsync(async (req, res) => {
  const driver = await driverService.registerDriver(req.body);
  const tokens = driverService.generateAuthTokens(driver);

  res.status(httpStatus.CREATED).json({
    status: "success",
    type: "driver",
    token: tokens.access.token,
    driver,
  });
});

/**
 * Login driver
 * @POST /driver/login
 */
const login = catchAsync(async (req, res) => {
  const { email } = req.body;
  const deviceInfo = {
    deviceID: req.body.deviceID,
    deviceType: req.body.deviceType,
    deviceToken: req.body.deviceToken,
  };

  const driver = await driverService.loginDriverWithEmail(email, deviceInfo);
  const tokens = driverService.generateAuthTokens(driver);

  res.status(httpStatus.OK).json({
    status: "success",
    type: "driver",
    token: tokens.access.token,
    driver,
  });
});

/**
 * Logout driver
 * @POST /driver/logout
 */
const logout = catchAsync(async (req, res) => {
  await driverService.logoutDriver(req.user);

  res.status(httpStatus.OK).json({
    status: "success",
    message: "Logged out successfully",
  });
});

/**
 * Get driver details
 * @GET /driver/details
 */
const getDetails = catchAsync(async (req, res) => {
  res.status(httpStatus.OK).json({
    status: "success",
    driver: req.user,
  });
});

/**
 * Update driver online status
 * @PATCH /driver/online-status
 */
const updateOnlineStatus = catchAsync(async (req, res) => {
  const { online } = req.body;
  const driver = await driverService.updateDriverOnlineStatus(req.user, online);

  res.status(httpStatus.OK).json({
    status: "success",
    message: `Driver is now ${online ? "online" : "offline"}`,
    driver,
  });
});

/**
 * Update driver location
 * @PATCH /driver/location
 */
const updateLocation = catchAsync(async (req, res) => {
  const location = {
    lat: req.body.lat,
    lng: req.body.lng,
  };

  const driver = await driverService.updateDriverLocation(req.user, location);

  res.status(httpStatus.OK).json({
    status: "success",
    message: "Location updated successfully",
    driver,
  });
});

module.exports = {
  register,
  login,
  logout,
  getDetails,
  updateOnlineStatus,
  updateLocation,
};
