const mongoose = require("mongoose");

const timeslotSchema = new mongoose.Schema({
  office: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Office",
    required: true,
  },
  type: {
    type: String,
    enum: ["login", "logout"],
    required: true,
  },
  times: [
    {
      time: { type: String, required: true },
      maxBookings: { type: Number, default: 12 },
    },
  ],
});

module.exports = mongoose.model("Timeslot", timeslotSchema);
