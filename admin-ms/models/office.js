const mongoose = require("mongoose");

const officeSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
  },
});

module.exports = mongoose.model("Office", officeSchema);
