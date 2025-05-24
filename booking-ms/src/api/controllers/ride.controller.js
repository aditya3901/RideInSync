const httpStatus = require("http-status");
const asyncHandler = require("../../utils/asyncHandler");
const RideService = require("../../services/ride.service");
const logger = require("../../config/logger");

/**
 * Controller for ride-related operations
 */
const rideController = {
  /**
   * Create a new ride
   * POST /rides
   */
  createRide: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const token = req.token;

    const ride = await RideService.createRide(req.body, userId, token);

    res.status(httpStatus.CREATED).json({
      status: "success",
      data: {
        ride: ride,
      },
    });
  }),

  /**
   * Get ride by ID
   * GET /rides/:rideId
   */
  getRide: asyncHandler(async (req, res) => {
    const { rideId } = req.params;
    const ride = await RideService.getRideById(rideId);

    res.status(httpStatus.OK).json({
      status: "success",
      data: {
        ride: ride,
      },
    });
  }),

  /**
   * Get rides for the current user
   * GET /rides/me
   */
  getUserRides: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const rides = await RideService.getUserRides(userId, req.query);

    res.status(httpStatus.OK).json({
      status: "success",
      results: rides.length,
      data: {
        rides: rides,
      },
    });
  }),

  /**
   * Update ride status
   * PATCH /rides/:rideId/status
   */
  updateRideStatus: asyncHandler(async (req, res) => {
    const { rideId } = req.params;
    const { status } = req.body;

    const ride = await RideService.updateRideStatus(rideId, status);

    res.status(httpStatus.OK).json({
      status: "success",
      data: {
        ride: ride,
      },
    });
  }),

  /**
   * Cancel a ride
   * POST /rides/:rideId/cancel
   */
  cancelRide: asyncHandler(async (req, res) => {
    const { rideId } = req.params;
    const { reason } = req.body;

    const ride = await RideService.cancelRide(rideId, reason);

    res.status(httpStatus.OK).json({
      status: "success",
      data: {
        ride: ride,
      },
    });
  }),

  /**
   * Rate a completed ride
   * POST /rides/:rideId/rate
   */
  rateRide: asyncHandler(async (req, res) => {
    const { rideId } = req.params;
    const { rating, feedback } = req.body;

    const ride = await RideService.rateRide(rideId, rating, feedback);

    res.status(httpStatus.OK).json({
      status: "success",
      data: {
        ride: ride,
      },
    });
  }),
};

module.exports = rideController;
