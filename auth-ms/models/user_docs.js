const mongoose = require("mongoose");

const userDocsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
});

module.exports = mongoose.model("UserDocs", userDocsSchema);
