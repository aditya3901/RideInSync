const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  mobile: {
    type: String,
    required: [true, "Please provide your mobile number"],
    unique: true,
    validate: {
      validator: function (v) {
        return /\d{10}/.test(v);
      },
      message: (props) => `${props.value} is not a valid mobile number!`,
    },
  },
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
  uploadedDocuments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserUploadDocs",
    },
  ],
  verified: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", userSchema);
