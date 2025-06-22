const cron = require("node-cron");
const logger = require("../config/logger");
const RideService = require("../services/ride.service");
const config = require("../config/env.config");
const { ClusteringConstants } = require("../constants/ride.constants");

/**
 * Cron job for ride assignments
 * Runs hourly to assign pending rides to drivers based on route clustering
 */
class RideAssignmentJob {
  constructor() {
    this.isRunning = false;
    this.clusterSize = ClusteringConstants.DEFAULT_CLUSTER_SIZE;
    this.similarityThreshold = ClusteringConstants.DEFAULT_SIMILARITY_THRESHOLD;
  }

  /**
   * Start the cron job
   */
  start() {
    // Schedule to run every hour at the start of the hour
    // "0 * * * *" = At minute 0 of every hour
    cron.schedule("0 * * * *", async () => {
      await this.run();
    });

    logger.info("Ride assignment job scheduled to run hourly");
  }

  /**
   * Run the job manually
   */
  async run() {
    if (this.isRunning) {
      logger.warn("Ride assignment job is already running");
      return { success: false, message: "Job is already running" };
    }

    this.isRunning = true;
    logger.info("Starting ride assignment job");

    try {
      const result = await this.processNextTimeslot();
      this.isRunning = false;
      logger.info("Ride assignment job completed successfully");
      return { success: true, ...result };
    } catch (error) {
      this.isRunning = false;
      logger.error("Error in ride assignment job:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process the next timeslot
   */
  async processNextTimeslot() {
    // Look for rides in the next hour
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    logger.info(`Looking for rides between ${now} and ${oneHourLater}`);

    // Find pending rides by timeslot
    const timeslotRides = await RideService.findPendingRidesByTimeslot(
      now.toISOString(),
      oneHourLater.toISOString()
    );

    if (!timeslotRides || timeslotRides.length === 0) {
      logger.info("No upcoming timeslots with pending rides found");
      return { processedTimeslots: 0, assignedRides: 0, totalClusters: 0 };
    }

    logger.info(`Found ${timeslotRides.length} timeslots with pending rides`);

    // Assign rides to drivers using route clustering
    const results = await RideService.assignRidesToDrivers(
      timeslotRides,
      this.clusterSize,
      this.similarityThreshold
    );

    return results;
  }

  /**
   * Update configuration parameters
   * @param {Object} config - Configuration object
   */
  updateConfig({ clusterSize, similarityThreshold }) {
    if (clusterSize !== undefined) {
      this.clusterSize = clusterSize;
      logger.info(`Updated cluster size to ${clusterSize}`);
    }

    if (similarityThreshold !== undefined) {
      this.similarityThreshold = similarityThreshold;
      logger.info(`Updated similarity threshold to ${similarityThreshold}`);
    }

    return {
      clusterSize: this.clusterSize,
      similarityThreshold: this.similarityThreshold,
      isRunning: this.isRunning,
    };
  }

  /**
   * Get current job status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      clusterSize: this.clusterSize,
      similarityThreshold: this.similarityThreshold,
    };
  }
}

// Create and export a singleton instance
module.exports = new RideAssignmentJob();
