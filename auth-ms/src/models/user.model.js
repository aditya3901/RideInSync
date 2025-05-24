const mongoose = require("mongoose");
const validator = require("validator");

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "Point",
    enum: ["Point"],
  },
  coordinates: {
    type: [Number],
    index: "2dsphere",
  },
  address: String,
  landmark: String,
  place_id: String,
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
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
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    device_id: String,
    device_type: String,
    device_token: String,
    primary_address: {
      type: addressSchema,
      default: null,
    },
    secondary_address: {
      type: addressSchema,
      default: null,
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
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = { User, userSchema };
