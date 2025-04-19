const mongoose = require("mongoose");

const officeSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
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
  },
  {
    timestamps: true,
  }
);

officeSchema.index({ location: "2dsphere" });

/**
 * @typedef Office
 */
const Office = mongoose.model("Office", officeSchema);

module.exports = Office;
