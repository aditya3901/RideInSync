const express = require("express");
const rideAssignmentController = require("../controllers/rideAssignmentController");
const bookingController = require("../controllers/booking_controller");

const router = express.Router();

// Protect all routes after this middleware
router.use(bookingController.protect);

// Routes for manual ride assignment
router.post("/assign", rideAssignmentController.manualAssignment);
router.get("/status", rideAssignmentController.getStatus);
router.post("/config", rideAssignmentController.updateConfig);

module.exports = router;
