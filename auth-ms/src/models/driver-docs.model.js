const mongoose = require("mongoose");

const driverDocsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  required: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const driverUploadDocsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  doc_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DriverDocs",
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
});

const DriverDocs = mongoose.model("DriverDocs", driverDocsSchema);
const DriverUploadDocs = mongoose.model(
  "DriverUploadDocs",
  driverUploadDocsSchema
);

module.exports = { DriverDocs, DriverUploadDocs };
