const mongoose = require("mongoose");

const userUploadDocsSchema = new mongoose.Schema({
  file: {
    type: String,
    required: [true, "File is required"],
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doc_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserDocs",
    required: true,
  },
});

module.exports = mongoose.model("UserUploadDocs", userUploadDocsSchema);
