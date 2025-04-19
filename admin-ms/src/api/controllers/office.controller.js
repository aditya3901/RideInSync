const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const { officeService } = require("../../services");

/**
 * Create a new office
 * @route POST /api/v1/admin/offices
 */
const createOffice = catchAsync(async (req, res) => {
  const { office } = await officeService.createOffice(req.body);
  res.status(httpStatus.CREATED).json({
    status: "success",
    office,
  });
});

/**
 * Get nearby offices
 * @route GET /api/v1/admin/offices/nearby
 */
const getNearbyOffices = catchAsync(async (req, res) => {
  const offices = await officeService.getNearbyOffices(req.query);
  res.status(httpStatus.OK).json({
    status: "success",
    results: offices.length,
    offices,
  });
});

module.exports = {
  createOffice,
  getNearbyOffices,
};
