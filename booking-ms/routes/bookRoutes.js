const express = require("express");
const bookingController = require("../controllers/booking_controller");

const router = express.Router();

router.post("/bookRide", bookingController.protect, bookingController.bookRide);

module.exports = router;
