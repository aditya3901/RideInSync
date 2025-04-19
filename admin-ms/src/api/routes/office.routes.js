const express = require("express");
const { officeController } = require("../controllers");
const validate = require("../middlewares/validate.middleware");
const { officeValidation } = require("../validators");

const router = express.Router();

router
  .route("/")
  .post(validate(officeValidation.createOffice), officeController.createOffice);

router
  .route("/nearby")
  .get(
    validate(officeValidation.getNearbyOffices),
    officeController.getNearbyOffices
  );

module.exports = router;
