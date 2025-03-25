const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Office = require("../models/office");
const Company = require("../models/company");
const officeService = require("../services/officeService");

exports.addCompany = catchAsync(async (req, res, _) => {
  const { name, email } = req.body;

  const company = await Company.create({
    name,
    email,
  });

  res.status(201).json({
    status: "success",
    company,
  });
});

exports.getAllCompanies = catchAsync(async (req, res, _) => {
  const companies = await Company.find({ isActive: true }).select(
    "-offices -__v -isActive"
  );

  res.status(200).json({
    status: "success",
    companies,
  });
});

exports.addOffice = catchAsync(async (req, res, _) => {
  const { company_id, name, address, lat, lng } = req.body;

  const office = await Office.create({
    company: company_id,
    name,
    address,
    location: {
      type: "Point",
      coordinates: [lng, lat],
    },
  });

  const company = await Company.findById(company_id);
  company.offices.push(office._id);
  await company.save();

  res.status(201).json({
    status: "success",
    office,
  });
});

exports.getNearbyOffices = catchAsync(async (req, res, next) => {
  const { company_id, latitude, longitude, maxDistance = 10000 } = req.query; // Default radius: 10km

  const offices = await officeService.getNearbyOffices({
    company_id,
    latitude,
    longitude,
    maxDistance,
  });

  res.status(200).json({
    status: "success",
    results: offices.length,
    offices,
  });
});
