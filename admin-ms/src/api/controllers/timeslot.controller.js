const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const { timeslotService } = require("../../services");
const ApiError = require("../../utils/ApiError");

/**
 * Get timeslots for an office
 * @route GET /api/v1/admin/timeslots
 */
const getTimeslots = catchAsync(async (req, res, next) => {
  const timeslots = await timeslotService.getFutureTimeslots(req.query);

  if (!timeslots || timeslots.length === 0) {
    return next(
      new ApiError("No available future slots", httpStatus.NOT_FOUND)
    );
  }

  res.status(httpStatus.OK).json({
    status: "success",
    results: timeslots.length,
    timeslots,
  });
});

/**
 * Add admin slots for an office
 * @route POST /api/v1/admin/timeslots
 */
const addAdminSlots = catchAsync(async (req, res) => {
  const adminSlots = await timeslotService.addAdminSlots(req.body);

  res.status(httpStatus.CREATED).json({
    status: "success",
    adminSlots,
  });
});

/**
 * Update a timeslot (increment booked count)
 * @route PATCH /api/v1/admin/timeslots/:timeslotId
 */
const updateTimeslot = catchAsync(async (req, res) => {
  const updatedTimeslot = await timeslotService.updateTimeslot({
    timeslotId: req.params.timeslotId,
  });

  res.status(httpStatus.OK).json({
    status: "success",
    timeslot: updatedTimeslot,
  });
});

module.exports = {
  getTimeslots,
  addAdminSlots,
  updateTimeslot,
};
