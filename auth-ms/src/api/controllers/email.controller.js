const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const { emailService } = require("../../services");

/**
 * Verify email and check if it belongs to a user or driver
 * @POST /common/verify-email
 */
const verifyEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await emailService.verifyEmail(email);

  res.status(httpStatus.OK).json({
    status: "success",
    ...result,
  });
});

module.exports = {
  verifyEmail,
};
