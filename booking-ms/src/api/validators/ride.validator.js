const Joi = require("joi");
const { RideType, RideStatus } = require("../../constants/ride.constants");

/**
 * Validation schemas for ride-related operations
 */
const rideValidation = {
  /**
   * Schema for creating a new ride
   */
  createRide: {
    body: Joi.object().keys({
      isLogin: Joi.boolean().required(),
      date: Joi.date().iso().required(),
      office_id: Joi.string().required(),
      timeslot_id: Joi.string().required(),
      home_type: Joi.string()
        .valid("primary_address", "secondary_address")
        .required(),
    }),
  },

  /**
   * Schema for getting a ride by ID
   */
  getRide: {
    params: Joi.object().keys({
      rideId: Joi.string().required(),
    }),
  },

  /**
   * Schema for getting rides for a user
   */
  getUserRides: {
    query: Joi.object().keys({
      status: Joi.string().valid(...Object.values(RideStatus)),
      type: Joi.string().valid(...Object.values(RideType)),
      from: Joi.date().iso(),
      to: Joi.date().iso().greater(Joi.ref("from")),
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(100),
    }),
  },

  /**
   * Schema for updating ride status
   */
  updateRideStatus: {
    params: Joi.object().keys({
      rideId: Joi.string().required(),
    }),
    body: Joi.object().keys({
      status: Joi.string()
        .valid(...Object.values(RideStatus))
        .required(),
    }),
  },

  /**
   * Schema for cancelling a ride
   */
  cancelRide: {
    params: Joi.object().keys({
      rideId: Joi.string().required(),
    }),
    body: Joi.object().keys({
      reason: Joi.string().required(),
    }),
  },

  /**
   * Schema for rating a ride
   */
  rateRide: {
    params: Joi.object().keys({
      rideId: Joi.string().required(),
    }),
    body: Joi.object().keys({
      rating: Joi.number().min(1).max(5).required(),
      feedback: Joi.string().max(500),
    }),
  },

  /**
   * Schema for updating ride assignment configuration
   */
  updateAssignmentConfig: {
    body: Joi.object()
      .keys({
        clusterSize: Joi.number().integer().min(1).max(10),
        similarityThreshold: Joi.number().min(0).max(1),
      })
      .min(1),
  },
};

module.exports = rideValidation;
