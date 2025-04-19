const mongoose = require("mongoose");
const { TimeslotType } = require("../constants/timeslot.constants");

const timeslotSchema = new mongoose.Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TimeslotType),
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    time: {
      type: String,
      required: true,
    },
    booked: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef Timeslot
 */
const Timeslot = mongoose.model("Timeslot", timeslotSchema);

module.exports = Timeslot;
