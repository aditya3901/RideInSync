const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const axios = require("axios");

exports.getOffice = catchAsync(async (req, res, next) => {
  const { company, city } = req.params;

  try {
    const response = await axios.get(
      `${process.env.GATEWAY_SERVICE_URL}/admin/getOffice/${company}/${city}`
    );

    res.status(200).json(response.data);
  } catch (error) {
    return next(new AppError("Error fetching office data", 500));
  }
});

exports.getTimeslots = catchAsync(async (req, res, next) => {
  const { company, type } = req.params;

  try {
    const response = await axios.get(
      `${process.env.GATEWAY_SERVICE_URL}/admin/getTimeslots/${company}/${type}`
    );

    res.status(200).json(response.data);
  } catch (error) {
    return next(new AppError("Error fetching timeslots data", 500));
  }
});
