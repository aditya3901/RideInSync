const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const Driver = require("../../models/driver");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");

const createSendToken = (driver, statusCode, res, type) => {
  const token = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(statusCode).json({
    status: "success",
    type: type,
    token: token,
    driver: driver,
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const {
    deviceID,
    deviceType,
    deviceToken,
    mobile,
    name,
    email,
    vehicle_number,
    vehicle_model,
  } = req.body;

  const driver = await Driver.findOne({ mobile });
  if (driver) {
    return next(new AppError("Driver Already Exists with this mobile", 400));
  }

  const newDriver = await Driver.create({
    name,
    email,
    mobile,
    vehicle_number,
    vehicle_model,
    device_id: deviceID,
    device_type: deviceType,
    device_token: deviceToken,
  });

  createSendToken(newDriver, 201, res, "driver");
});

exports.login = catchAsync(async (req, res, _) => {
  const { email, deviceID, deviceType, deviceToken } = req.body;

  const driver = await Driver.findOne({ email });
  if (!driver) {
    res.status(404).json({
      status: "fail",
      message: "Driver not found",
    });
    return;
  }

  driver.device_id = deviceID;
  driver.device_type = deviceType;
  driver.device_token = deviceToken;
  await driver.save();

  createSendToken(driver, 200, res, "driver");
});

exports.protect = catchAsync(async (req, _, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const driver = await Driver.findById(decoded.id);
  if (!driver) {
    return next(
      new AppError(
        "The driver belonging to this token does no longer exist.",
        401
      )
    );
  }

  req.driver = driver;
  next();
});

exports.logout = catchAsync(async (req, res, _) => {
  const driver = req.driver;
  driver.device_id = null;
  driver.device_type = null;
  driver.device_token = null;
  await driver.save();

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

exports.getDetails = catchAsync(async (req, res, _) => {
  const driver = req.driver;
  res.status(200).json({
    status: "success",
    driver: driver,
  });
});
