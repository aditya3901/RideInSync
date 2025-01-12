const mongoose = require("mongoose");

const driverUploadDocsSchema = new mongoose.Schema({
  file: {
    type: String,
    required: true,
  },
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  doc_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DriverDocs",
    required: true,
  },
});

module.exports = mongoose.model("DriverUploadDocs", driverUploadDocsSchema);
