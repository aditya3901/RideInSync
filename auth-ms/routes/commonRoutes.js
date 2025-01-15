const express = require("express");
const verifyEmailController = require("../controllers/common/verifyEmailController");

const router = express.Router();

router.post("/verifyEmail", verifyEmailController.verifyEmail);

module.exports = router;
