const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
    },
    timeslot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timeslot",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["login", "logout"],
      required: true,
    },
    home_location: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        required: true,
        index: "2dsphere",
      },
      address: String,
      landmark: String,
      place_id: String,
    },
    status: {
      type: String,
      enum: ["pending", "scheduled", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    assignedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
  }
);

rideSchema.index({ home_location: "2dsphere" });

module.exports = mongoose.model("Ride", rideSchema);
