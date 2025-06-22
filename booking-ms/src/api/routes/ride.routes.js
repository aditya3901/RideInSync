const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const rideValidation = require("../validators/ride.validator");
const rideController = require("../controllers/ride.controller");

const router = express.Router();

/**
 * @route   POST /rides
 * @desc    Create a new ride
 * @access  Private
 */
router.post(
  "/",
  authenticate,
  validate(rideValidation.createRide),
  rideController.createRide
);

/**
 * @route   GET /rides/:rideId
 * @desc    Get ride by ID
 * @access  Private
 */
router.get(
  "/:rideId",
  authenticate,
  validate(rideValidation.getRide),
  rideController.getRide
);

/**
 * @route   PATCH /rides/:rideId/status
 * @desc    Update ride status
 * @access  Private
 */
router.patch(
  "/:rideId/status",
  authenticate,
  validate(rideValidation.updateRideStatus),
  rideController.updateRideStatus
);

/**
 * @route   POST /rides/:rideId/cancel
 * @desc    Cancel a ride
 * @access  Private
 */
router.post(
  "/:rideId/cancel",
  authenticate,
  validate(rideValidation.cancelRide),
  rideController.cancelRide
);

/**
 * @route   POST /rides/:rideId/rate
 * @desc    Rate a completed ride
 * @access  Private
 */
router.post(
  "/:rideId/rate",
  authenticate,
  validate(rideValidation.rateRide),
  rideController.rateRide
);

/**
 * @route   GET /rides/user/upcoming
 * @desc    Get upcoming rides for a user
 * @access  Private
 */
router.get(
  "/user/upcoming",
  authenticate,
  validate(rideValidation.getUpcomingRides),
  rideController.getUserRides
);

/**
 * @route   GET /rides/driver/upcoming
 * @desc    Get upcoming rides for a driver
 * @access  Private
 */
router.get(
  "/driver/upcoming",
  authenticate,
  validate(rideValidation.getUpcomingRides),
  rideController.getDriverUpcomingRides
);

module.exports = router;
