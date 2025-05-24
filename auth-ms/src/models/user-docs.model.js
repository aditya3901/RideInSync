const mongoose = require("mongoose");

const userDocsSchema = new mongoose.Schema({
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

const userUploadDocsSchema = new mongoose.Schema({
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
  file: {
    type: String,
    required: true,
  },
});

const UserDocs = mongoose.model("UserDocs", userDocsSchema);
const UserUploadDocs = mongoose.model("UserUploadDocs", userUploadDocsSchema);

module.exports = { UserDocs, UserUploadDocs };
