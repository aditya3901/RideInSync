const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const timeslotService = require("../services/timeslotService");

exports.getTimeslots = catchAsync(async (req, res, next) => {
  const { date, office_id, type, userTime } = req.body;

  const timeslots = await timeslotService.getFutureTimeslots({
    date,
    office_id,
    type,
    userTime,
  });

  if (!timeslots || timeslots.length === 0) {
    return next(new AppError("No available future slots", 404));
  }

  res.status(200).json({
    status: "success",
    timeslots,
  });
});

exports.addAdminSlots = catchAsync(async (req, res, _) => {
  const { office, login_slots, logout_slots } = req.body;

  const adminSlots = await timeslotService.addAdminSlots({
    office,
    login_slots,
    logout_slots,
  });

  res.status(201).json({
    status: "success",
    adminSlots,
  });
});
