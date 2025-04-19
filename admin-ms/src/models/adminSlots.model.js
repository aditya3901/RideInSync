const mongoose = require("mongoose");
const { DefaultSlotValues } = require("../constants/timeslot.constants");

const slotSchema = {
  time: {
    type: String,
    required: true,
  },
  booked: {
    type: Number,
    required: true,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
    default: DefaultSlotValues.DEFAULT_CAPACITY,
  },
};

const adminSlotsSchema = new mongoose.Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
      index: true,
    },
    login_slots: [slotSchema],
    logout_slots: [slotSchema],
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef AdminSlots
 */
const AdminSlots = mongoose.model("AdminSlots", adminSlotsSchema);

module.exports = AdminSlots;
