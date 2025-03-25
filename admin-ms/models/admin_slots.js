const mongoose = require("mongoose");

const adminSlotsSchema = new mongoose.Schema({
  office: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Office",
    required: true,
  },
  login_slots: [
    {
      time: { type: String, required: true },
      booked: { type: Number, required: true, default: 0 },
      total: { type: Number, required: true },
    },
  ],
  logout_slots: [
    {
      time: { type: String, required: true },
      booked: { type: Number, required: true, default: 0 },
      total: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model("AdminSlots", adminSlotsSchema);
