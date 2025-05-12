const express = require("express");
const { timeslotController } = require("../controllers");
const validate = require("../middlewares/validate.middleware");
const { timeslotValidation } = require("../validators");

const router = express.Router();

router
  .route("/")
  .post(
    validate(timeslotValidation.addAdminSlots),
    timeslotController.addAdminSlots
  )
  .get(
    validate(timeslotValidation.getTimeslots),
    timeslotController.getTimeslots
  );

router
  .route("/range")
  .get(
    validate(timeslotValidation.getTimeslotsByTimeRange),
    timeslotController.getTimeslotsByTimeRange
  );

router
  .route("/:timeslotId")
  .patch(
    validate(timeslotValidation.updateTimeslot),
    timeslotController.updateTimeslot
  );

module.exports = router;
