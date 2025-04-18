const httpStatus = require("http-status");
const asyncHandler = require("../../utils/asyncHandler");
const rideAssignmentJob = require("../../jobs/rideAssignment.job");
const logger = require("../../config/logger");

/**
 * Controller for ride assignment operations
 */
const assignmentController = {
  /**
   * Trigger manual ride assignment
   * POST /assignments/trigger
   */
  triggerAssignment: asyncHandler(async (req, res) => {
    logger.info("Manual ride assignment triggered");

    const result = await rideAssignmentJob.run();

    if (!result.success) {
      return res.status(httpStatus.CONFLICT).json({
        status: "error",
        message: result.message || "Failed to trigger assignment",
      });
    }

    res.status(httpStatus.OK).json({
      status: "success",
      message: "Route-based assignment completed successfully",
      data: {
        processedTimeslots: result.processedTimeslots,
        assignedRides: result.assignedRides,
        totalClusters: result.totalClusters,
      },
    });
  }),

  /**
   * Get assignment job status
   * GET /assignments/status
   */
  getStatus: asyncHandler(async (req, res) => {
    const status = rideAssignmentJob.getStatus();

    res.status(httpStatus.OK).json({
      status: "success",
      data: status,
    });
  }),

  /**
   * Update assignment configuration
   * PATCH /assignments/config
   */
  updateConfig: asyncHandler(async (req, res) => {
    const { clusterSize, similarityThreshold } = req.body;

    const updatedConfig = rideAssignmentJob.updateConfig({
      clusterSize,
      similarityThreshold,
    });

    res.status(httpStatus.OK).json({
      status: "success",
      message: "Assignment configuration updated successfully",
      data: updatedConfig,
    });
  }),
};

module.exports = assignmentController;
