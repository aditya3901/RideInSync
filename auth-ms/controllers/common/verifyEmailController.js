const User = require("../../models/user");
const Driver = require("../../models/driver");
const catchAsync = require("../../utils/catchAsync");

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    res.status(200).json({
      status: "success",
      type: "user",
      mobile: user.mobile,
    });
    return;
  }

  const driver = await Driver.findOne({ email });
  if (driver) {
    res.status(200).json({
      status: "success",
      type: "driver",
      mobile: driver.mobile,
    });
    return;
  }

  res.status(404).json({
    status: "fail",
    message: "No user found with this email",
  });
});
