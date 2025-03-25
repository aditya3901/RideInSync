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
  date: {
    type: Date,
    required: true,
  },
  time: { type: String, required: true },
  booked: { type: Number, required: true },
  total: { type: Number, required: true },
});

module.exports = mongoose.model("Timeslot", timeslotSchema);
