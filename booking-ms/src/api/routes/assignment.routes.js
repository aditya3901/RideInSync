const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const rideValidation = require("../validators/ride.validator");
const assignmentController = require("../controllers/assignment.controller");

const router = express.Router();

/**
 * @route   POST /assignments/trigger
 * @desc    Trigger manual ride assignment
 * @access  Private
 */
router.post("/trigger", authenticate, assignmentController.triggerAssignment);

/**
 * @route   GET /assignments/status
 * @desc    Get assignment job status
 * @access  Private
 */
router.get("/status", authenticate, assignmentController.getStatus);

/**
 * @route   PATCH /assignments/config
 * @desc    Update assignment configuration
 * @access  Private
 */
router.patch(
  "/config",
  authenticate,
  validate(rideValidation.updateAssignmentConfig),
  assignmentController.updateConfig
);

module.exports = router;
