const mongoose = require("mongoose");

const driverDocsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("DriverDocs", driverDocsSchema);
