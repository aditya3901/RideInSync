const express = require("express");
const { companyController } = require("../controllers");
const validate = require("../middlewares/validate.middleware");
const { companyValidation } = require("../validators");

const router = express.Router();

router
  .route("/")
  .post(
    validate(companyValidation.createCompany),
    companyController.createCompany
  )
  .get(companyController.getAllCompanies);

module.exports = router;
