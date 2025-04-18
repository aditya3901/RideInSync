const mongoose = require("mongoose");
const { RideStatus, RideType } = require("../constants/ride.constants");

/**
 * Location schema for GeoJSON points
 */
const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "Point",
    enum: ["Point"],
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    index: "2dsphere",
  },
  address: String,
  landmark: String,
  place_id: String,
});

/**
 * Ride schema
 */
const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
      index: true,
    },
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
      index: true,
    },
    timeslot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timeslot",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(RideType),
      required: true,
      index: true,
    },
    home_location: {
      type: locationSchema,
      required: true,
    },
    office_location: {
      type: locationSchema,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(RideStatus),
      default: RideStatus.PENDING,
      index: true,
    },
    cluster_id: {
      type: String,
      default: null,
      index: true,
    },
    estimated_pickup_time: Date,
    estimated_arrival_time: Date,
    actual_pickup_time: Date,
    actual_arrival_time: Date,
    ride_start_location: locationSchema,
    ride_end_location: locationSchema,
    distance: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    feedback: String,
    fare: {
      type: Number,
      default: 0,
    },
    assignedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancellation_reason: String,
  },
  {
    timestamps: true,
  }
);

// Compound indexes for frequent queries
rideSchema.index({ status: 1, date: 1 });
rideSchema.index({ status: 1, driver: 1 });
rideSchema.index({ status: 1, user: 1 });
rideSchema.index({ timeslot: 1, type: 1, status: 1 });
rideSchema.index({ home_location: "2dsphere" });

/**
 * Add pre-save hook to set virtual fields
 */
rideSchema.pre("save", function (next) {
  // Set assignedAt timestamp when status changes to SCHEDULED
  if (
    this.isModified("status") &&
    this.status === RideStatus.SCHEDULED &&
    !this.assignedAt
  ) {
    this.assignedAt = new Date();
  }

  // Set completedAt timestamp when status changes to COMPLETED
  if (
    this.isModified("status") &&
    this.status === RideStatus.COMPLETED &&
    !this.completedAt
  ) {
    this.completedAt = new Date();
  }

  // Set cancelledAt timestamp when status changes to CANCELLED
  if (
    this.isModified("status") &&
    this.status === RideStatus.CANCELLED &&
    !this.cancelledAt
  ) {
    this.cancelledAt = new Date();
  }

  next();
});

/**
 * @typedef Ride
 */
const Ride = mongoose.model("Ride", rideSchema);

module.exports = Ride;
