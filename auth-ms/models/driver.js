const mongoose = require("mongoose");
const validator = require("validator");

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
    validate: [validator.isMobilePhone, "Please provide a valid mobile number"],
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  online: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  vehicle_number: {
    type: String,
    required: true,
    trim: true,
  },
  vehicle_model: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  total_rides: {
    type: Number,
    default: 0,
  },
  uploadedDocuments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriverUploadDocs",
    },
  ],
  device_id: String,
  device_type: String,
  device_token: String,
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

module.exports = mongoose.model("Driver", driverSchema);
