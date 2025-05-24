const httpStatus = require("http-status");
const { Company } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create a new company
 * @param {Object} companyBody
 * @returns {Promise<Company>}
 */
const createCompany = async (companyBody) => {
  return Company.create(companyBody);
};

/**
 * Get all active companies
 * @returns {Promise<Company[]>}
 */
const getAllCompanies = async () => {
  return Company.find({ isActive: true }).select("-offices -__v -isActive");
};

module.exports = {
  createCompany,
  getAllCompanies,
};
