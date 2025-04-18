const httpStatus = require("http-status");
const mongoose = require("mongoose");
const Ride = require("../models/ride.model");
const HttpService = require("../utils/httpService");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");
const { RideStatus, RideType } = require("../constants/ride.constants");
const RouteOverlapService = require("./routeOverlap.service");

/**
 * Service for ride-related operations
 */
class RideService {
  /**
   * Create a new ride
   * @param {Object} rideData - Ride data
   * @param {string} userId - User ID
   * @param {string} token - User token for API calls
   * @returns {Promise<Object>} - Created ride
   */
  static async createRide(rideData, userId, token) {
    const { isLogin, date, office_id, timeslot_id, home_type } = rideData;

    logger.info(
      `Creating ${isLogin ? "login" : "logout"} ride for user ${userId}`
    );

    try {
      // Update timeslot via gateway service
      await HttpService.post(`/admin/updateTimeslot/${timeslot_id}`, {}, token);

      // Fetch home address from user service
      const userAddressResponse = await HttpService.get(
        `/auth/user/address?type=${home_type}`,
        {},
        token
      );

      if (!userAddressResponse.address) {
        throw new ApiError(
          "Failed to fetch home address",
          httpStatus.BAD_REQUEST
        );
      }

      const home_address = userAddressResponse.address;

      // Create ride
      const ride = await Ride.create({
        user: userId,
        office: office_id,
        timeslot: timeslot_id,
        date: new Date(date),
        type: isLogin ? RideType.LOGIN : RideType.LOGOUT,
        home_location: {
          type: "Point",
          coordinates: home_address.coordinates,
          address: home_address.address,
          landmark: home_address.landmark,
          place_id: home_address.place_id,
        },
        status: RideStatus.PENDING,
      });

      logger.info(`Created ride with ID ${ride._id}`);

      return ride;
    } catch (error) {
      logger.error("Error creating ride:", error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        `Failed to book ride: ${error.message}`,
        httpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get ride by ID
   * @param {string} rideId - Ride ID
   * @returns {Promise<Object>} - Ride object
   */
  static async getRideById(rideId) {
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      throw new ApiError("Invalid ride ID", httpStatus.BAD_REQUEST);
    }

    const ride = await Ride.findById(rideId)
      .populate("driver")
      .populate("office")
      .populate("timeslot");

    if (!ride) {
      throw new ApiError("Ride not found", httpStatus.NOT_FOUND);
    }

    return ride;
  }

  /**
   * Get rides for a user
   * @param {string} userId - User ID
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Object[]>} - Array of rides
   */
  static async getUserRides(userId, filter = {}) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError("Invalid user ID", httpStatus.BAD_REQUEST);
    }

    logger.info(
      `Fetching rides for user ${userId} with filter ${JSON.stringify(filter)}`
    );

    return Ride.find({ user: userId, ...filter })
      .sort({ date: -1 })
      .populate("driver")
      .populate("office")
      .populate("timeslot");
  }

  /**
   * Update ride status
   * @param {string} rideId - Ride ID
   * @param {string} status - New status
   * @param {Object} updateData - Additional update data
   * @returns {Promise<Object>} - Updated ride
   */
  static async updateRideStatus(rideId, status, updateData = {}) {
    const ride = await this.getRideById(rideId);

    if (!Object.values(RideStatus).includes(status)) {
      throw new ApiError("Invalid ride status", httpStatus.BAD_REQUEST);
    }

    logger.info(
      `Updating ride ${rideId} status from ${ride.status} to ${status}`
    );

    ride.status = status;

    // Set timestamps based on status
    if (status === RideStatus.SCHEDULED && !ride.assignedAt) {
      ride.assignedAt = new Date();
    } else if (status === RideStatus.COMPLETED && !ride.completedAt) {
      ride.completedAt = new Date();
    } else if (status === RideStatus.CANCELLED && !ride.cancelledAt) {
      ride.cancelledAt = new Date();
    }

    // Apply additional updates
    Object.keys(updateData).forEach((key) => {
      ride[key] = updateData[key];
    });

    await ride.save();
    return ride;
  }

  /**
   * Cancel a ride
   * @param {string} rideId - Ride ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} - Cancelled ride
   */
  static async cancelRide(rideId, reason) {
    return this.updateRideStatus(rideId, RideStatus.CANCELLED, {
      cancellation_reason: reason,
      cancelledAt: new Date(),
    });
  }

  /**
   * Rate a completed ride
   * @param {string} rideId - Ride ID
   * @param {number} rating - Rating (1-5)
   * @param {string} feedback - Feedback comment
   * @returns {Promise<Object>} - Updated ride
   */
  static async rateRide(rideId, rating, feedback = "") {
    const ride = await this.getRideById(rideId);

    if (ride.status !== RideStatus.COMPLETED) {
      throw new ApiError(
        "Can only rate completed rides",
        httpStatus.BAD_REQUEST
      );
    }

    if (rating < 1 || rating > 5) {
      throw new ApiError(
        "Rating must be between 1 and 5",
        httpStatus.BAD_REQUEST
      );
    }

    ride.rating = rating;
    ride.feedback = feedback;

    await ride.save();

    // Update driver rating in auth service
    if (ride.driver) {
      try {
        await HttpService.post(`/auth/drivers/${ride.driver}/rate`, {
          rating,
          rideId: ride._id,
        });
      } catch (error) {
        logger.error(`Failed to update driver rating: ${error.message}`);
      }
    }

    return ride;
  }

  /**
   * Find pending rides for the next timeslot
   * @param {Date} startTime - Start time window
   * @param {Date} endTime - End time window
   * @returns {Promise<Object[]>} - Timeslots with pending rides
   */
  static async findPendingRidesByTimeslot(startTime, endTime) {
    logger.info(
      `Finding pending rides between ${startTime.toISOString()} and ${endTime.toISOString()}`
    );

    return Ride.aggregate([
      {
        $match: {
          status: RideStatus.PENDING,
          date: { $gte: startTime, $lte: endTime },
        },
      },
      {
        $lookup: {
          from: "timeslots",
          localField: "timeslot",
          foreignField: "_id",
          as: "timeslotDetails",
        },
      },
      {
        $unwind: "$timeslotDetails",
      },
      {
        $group: {
          _id: "$timeslot",
          date: { $first: "$date" },
          time: { $first: "$timeslotDetails.time" },
          type: { $first: "$type" },
          office: { $first: "$office" },
          count: { $sum: 1 },
          rides: { $push: "$$ROOT" },
        },
      },
      {
        $sort: {
          date: 1,
          time: 1,
        },
      },
    ]);
  }

  /**
   * Assign rides to drivers based on route clustering
   * @param {Object[]} timeslotRides - Timeslots with pending rides
   * @param {number} clusterSize - Maximum cluster size
   * @param {number} similarityThreshold - Minimum route similarity threshold
   * @returns {Promise<Object>} - Assignment results
   */
  static async assignRidesToDrivers(
    timeslotRides,
    clusterSize,
    similarityThreshold
  ) {
    const results = {
      processedTimeslots: 0,
      assignedRides: 0,
      totalClusters: 0,
    };

    if (!timeslotRides || timeslotRides.length === 0) {
      logger.info("No timeslots with pending rides to process");
      return results;
    }

    logger.info(
      `Processing ${timeslotRides.length} timeslots for driver assignment`
    );

    for (const timeslot of timeslotRides) {
      logger.info(
        `Processing timeslot ${timeslot._id} with ${timeslot.rides.length} rides`
      );
      results.processedTimeslots++;

      // Fetch available drivers
      let availableDrivers;
      try {
        const driversResponse = await HttpService.get(
          "/auth/drivers/available"
        );
        availableDrivers = driversResponse.drivers || [];
      } catch (error) {
        logger.error("Failed to fetch available drivers:", error);
        availableDrivers = [];
      }

      if (!availableDrivers || availableDrivers.length === 0) {
        logger.warn("No available drivers for assignment");
        continue;
      }

      logger.info(`Found ${availableDrivers.length} available drivers`);

      const rides = timeslot.rides;

      // Skip if not enough rides
      if (rides.length < 2) {
        logger.info(
          `Not enough rides (${rides.length}) for clustering in timeslot ${timeslot._id}`
        );

        // If there's only one ride, assign it directly
        if (rides.length === 1 && availableDrivers.length > 0) {
          const ride = rides[0];
          const driver = availableDrivers[0];

          try {
            await this.updateRideStatus(ride._id, RideStatus.SCHEDULED, {
              driver: driver._id,
              assignedAt: new Date(),
            });

            await HttpService.put(`/auth/drivers/${driver._id}/availability`, {
              isAvailable: false,
            });

            results.assignedRides++;
            results.totalClusters++;

            logger.info(
              `Assigned single ride ${ride._id} to driver ${driver._id}`
            );
          } catch (error) {
            logger.error(`Failed to assign single ride ${ride._id}:`, error);
          }
        }

        continue;
      }

      // Get routes for all rides
      const rideRoutes = await RouteOverlapService.getRideRoutes(rides);

      // Cluster rides based on route similarity
      const clusters = RouteOverlapService.clusterRides(
        rideRoutes,
        clusterSize,
        similarityThreshold
      );

      logger.info(
        `Created ${clusters.length} ride clusters for timeslot ${timeslot._id}`
      );
      results.totalClusters += clusters.length;

      // Assign each cluster to an available driver
      for (let i = 0; i < clusters.length && i < availableDrivers.length; i++) {
        const cluster = clusters[i];
        const driver = availableDrivers[i];

        try {
          // Generate unique cluster ID
          const clusterId = `${timeslot._id}_${driver._id}_${Date.now()}`;

          // Update all rides in this cluster
          const rideIds = cluster.map((item) => item.ride._id);

          const updateOps = rideIds.map((rideId) =>
            this.updateRideStatus(rideId, RideStatus.SCHEDULED, {
              driver: driver._id,
              cluster_id: clusterId,
              assignedAt: new Date(),
            })
          );

          await Promise.all(updateOps);

          // Mark driver as unavailable
          await HttpService.put(`/auth/drivers/${driver._id}/availability`, {
            isAvailable: false,
          });

          results.assignedRides += rideIds.length;

          logger.info(
            `Assigned ${rideIds.length} rides to driver ${driver._id} in cluster ${clusterId}`
          );
        } catch (error) {
          logger.error(
            `Error assigning cluster to driver ${driver._id}:`,
            error
          );
        }
      }
    }

    logger.info(
      `Assignment complete. Processed ${results.processedTimeslots} timeslots, ` +
        `created ${results.totalClusters} clusters, assigned ${results.assignedRides} rides`
    );

    return results;
  }
}

module.exports = RideService;
