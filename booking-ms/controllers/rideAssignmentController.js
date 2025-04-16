const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const rideAssignmentCron = require("../utils/rideAssignmentCron");

/**
 * Controller for ride assignment operations
 * Allows manual triggering of the assignment process
 */
exports.manualAssignment = catchAsync(async (req, res, next) => {
  try {
    // Check if a job is already running
    if (rideAssignmentCron.isRunning) {
      return res.status(409).json({
        status: "error",
        message: "Assignment job is already running",
      });
    }

    // Start the job
    console.log(
      `[${new Date().toISOString()}] Manually triggering ride assignment job`
    );

    // Process the next timeslot
    await rideAssignmentCron.processNextTimeslot();

    return res.status(200).json({
      status: "success",
      message: "Route-based ride assignment completed successfully",
    });
  } catch (error) {
    console.error("Error in manual ride assignment:", error);
    return next(new AppError("Failed to assign rides", 500));
  }
});

/**
 * Get the status of the ride assignment job
 */
exports.getStatus = catchAsync(async (req, res) => {
  return res.status(200).json({
    status: "success",
    data: {
      isRunning: rideAssignmentCron.isRunning,
      clusterSize: rideAssignmentCron.clusterSize,
      similarityThreshold: rideAssignmentCron.similarityThreshold,
    },
  });
});

/**
 * Update clustering configuration
 */
exports.updateConfig = catchAsync(async (req, res, next) => {
  try {
    const { clusterSize, similarityThreshold } = req.body;

    if (clusterSize !== undefined) {
      if (clusterSize < 1 || clusterSize > 10) {
        return next(new AppError("Cluster size must be between 1 and 10", 400));
      }
      rideAssignmentCron.clusterSize = clusterSize;
    }

    if (similarityThreshold !== undefined) {
      if (similarityThreshold < 0 || similarityThreshold > 1) {
        return next(
          new AppError("Similarity threshold must be between 0 and 1", 400)
        );
      }
      rideAssignmentCron.similarityThreshold = similarityThreshold;
    }

    return res.status(200).json({
      status: "success",
      message: "Configuration updated successfully",
      data: {
        clusterSize: rideAssignmentCron.clusterSize,
        similarityThreshold: rideAssignmentCron.similarityThreshold,
      },
    });
  } catch (error) {
    console.error("Error updating configuration:", error);
    return next(new AppError("Failed to update configuration", 500));
  }
});
