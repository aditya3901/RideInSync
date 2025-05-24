const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const { companyService } = require("../../services");

/**
 * Create a new company
 * @route POST /api/v1/admin/companies
 */
const createCompany = catchAsync(async (req, res) => {
  const company = await companyService.createCompany(req.body);
  res.status(httpStatus.CREATED).json({
    status: "success",
    company,
  });
});

/**
 * Get all companies
 * @route GET /api/v1/admin/companies
 */
const getAllCompanies = catchAsync(async (req, res) => {
  const companies = await companyService.getAllCompanies();
  res.status(httpStatus.OK).json({
    status: "success",
    results: companies.length,
    companies,
  });
});

module.exports = {
  createCompany,
  getAllCompanies,
};
