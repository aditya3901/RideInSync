const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Office = require("../models/office");
const Timeslot = require("../models/timeslots");

exports.addOffice = catchAsync(async (req, res, _) => {
  const { company, name, address, city, state, location } = req.body;

  const office = await Office.create({
    company,
    name,
    address,
    city,
    state,
    location,
  });

  res.status(201).json({
    status: "success",
    office: office,
  });
});

exports.addTimeslots = catchAsync(async (req, res, _) => {
  const { company, type, times } = req.body;

  const timeslot = await Timeslot.create({
    company,
    type,
    times,
  });

  res.status(201).json({
    status: "success",
    timeslot: timeslot,
  });
});

exports.getOffice = catchAsync(async (req, res, next) => {
  const { company, city } = req.params;

  const offices = await Office.find({ company, city });

  if (offices.length === 0) {
    return next(new AppError("No office found", 404));
  }

  res.status(200).json({
    status: "success",
    offices: offices,
  });
});

exports.getTimeslots = catchAsync(async (req, res, next) => {
  const { company, type } = req.params;

  const timeslots = await Timeslot.find({ company, type });

  if (timeslots.length === 0) {
    return next(new AppError("No timeslots found", 404));
  }

  res.status(200).json({
    status: "success",
    timeslots: timeslots,
  });
});

// const getFutureTimeslots = async (companyId, type, userTime) => {
//   try {
//       const thresholdTime = moment(userTime, "HH:mm").add(1, 'hours').format("HH:mm");

//       const timeslots = await Timeslot.find({
//           company: companyId,
//           type: type,
//           "times.time": { $gte: thresholdTime } // Filter times >= 1 hour later
//       }).select('times');

//       return timeslots;
//   } catch (error) {
//       console.error("Error fetching future timeslots:", error);
//       throw error;
//   }
// };
