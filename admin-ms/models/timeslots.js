const mongoose = require("mongoose");

const timeslotSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  type: {
    type: String,
    enum: ["login", "logout"],
    required: true,
  },
  times: [
    {
      type: String,
      required: true,
    },
  ],
});

module.exports = mongoose.model("Timeslot", timeslotSchema);
