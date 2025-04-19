const httpStatus = require("http-status");
const { Office, Company } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create a new office
 * @param {Object} officeData
 * @returns {Promise<{office: Office, company: Company}>}
 */
const createOffice = async (officeData) => {
  const { company_id, name, address, lat, lng } = officeData;

  const company = await Company.findById(company_id);
  if (!company) {
    throw new ApiError("Company not found", httpStatus.NOT_FOUND);
  }

  const office = await Office.create({
    company: company_id,
    name,
    address,
    location: {
      type: "Point",
      coordinates: [lng, lat],
    },
  });

  company.offices.push(office.id);
  await company.save();

  return { office, company };
};

/**
 * Get nearby offices
 * @param {Object} query
 * @returns {Promise<Office[]>}
 */
const getNearbyOffices = async (query) => {
  const { company_id, latitude, longitude, maxDistance = 10000 } = query;

  let filter = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: parseInt(maxDistance, 10),
      },
    },
  };

  if (company_id) {
    filter.company = company_id;
  }

  return Office.find(filter);
};

module.exports = {
  createOffice,
  getNearbyOffices,
};
