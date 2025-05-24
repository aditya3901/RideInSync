const express = require("express");
const { emailController } = require("../controllers");
const validate = require("../middlewares/validate.middleware");
const { emailValidation } = require("../validators");

const router = express.Router();

router.post(
  "/verify-email",
  validate(emailValidation.verifyEmail),
  emailController.verifyEmail
);

module.exports = router;
