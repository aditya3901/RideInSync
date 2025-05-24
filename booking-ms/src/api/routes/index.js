const express = require("express");
const rideRoutes = require("./ride.routes");
const assignmentRoutes = require("./assignment.routes");

const router = express.Router();

/**
 * API Routes
 */
router.use("/rides", rideRoutes);
router.use("/assignments", assignmentRoutes);

/**
 * Health check route
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Booking service is up and running",
  });
});

module.exports = router;
