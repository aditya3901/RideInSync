const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");

const createSendToken = (user, statusCode, res, type) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(statusCode).json({
    status: "success",
    type: type,
    token: token,
    user: user,
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { deviceID, deviceType, deviceToken, mobile, name, email, company } =
    req.body;

  const user = await User.findOne({ mobile });
  if (user) {
    return next(new AppError("User Already Exists with this mobile", 400));
  }

  const newUser = await User.create({
    name,
    email,
    mobile,
    company,
    device_id: deviceID,
    device_type: deviceType,
    device_token: deviceToken,
  });

  createSendToken(newUser, 201, res, "user");
});

exports.login = catchAsync(async (req, res, _) => {
  const { email, deviceID, deviceType, deviceToken } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({
      status: "fail",
      message: "User not found",
    });
    return;
  }

  user.device_id = deviceID;
  user.device_type = deviceType;
  user.device_token = deviceToken;
  await user.save();

  createSendToken(user, 200, res, "user");
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
    return next(new AppError("You are not logged in!", 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError("The user for this token no longer exist.", 401));
  }

  req.user = user;
  next();
});

// const blacklistToken = async (token) => {};

exports.logout = catchAsync(async (req, res, _) => {
  const user = req.user;
  user.device_id = null;
  user.device_type = null;
  user.device_token = null;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

exports.getDetails = catchAsync(async (req, res, _) => {
  const user = req.user;
  res.status(200).json({
    status: "success",
    user: user,
  });
});

exports.setUserAddress = catchAsync(async (req, res, next) => {
  const user = req.user;
  const location = req.body;

  if (!["primary", "secondary"].includes(location.type)) {
    return next(
      new AppError(
        "Invalid address type. Must be 'primary' or 'secondary'",
        400
      )
    );
  }

  user[`${location.type}_address`] = {
    type: "Point",
    place_id: location.place_id,
    address: location.address,
    landmark: location.landmark ?? "",
    coordinates: [location.lat, location.lng],
  };

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Address updated successfully",
  });
});

exports.getUserAddress = catchAsync(async (req, res, next) => {
  const user = req.user;
  const type = req.query.type;

  if (!["primary", "secondary"].includes(type)) {
    return next(
      new AppError(
        "Invalid address type. Must be 'primary' or 'secondary'",
        400
      )
    );
  }

  res.status(200).json({
    status: "success",
    address: user[`${type}_address`],
  });
});
