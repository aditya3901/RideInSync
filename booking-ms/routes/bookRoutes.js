const express = require("express");
const bookingController = require("../controllers/booking_controller");

const router = express.Router();

router.get("/getOffice/:company/:city", bookingController.getOffice);
router.get("/getTimeslots/:company/:type", bookingController.getTimeslots);

module.exports = router;
