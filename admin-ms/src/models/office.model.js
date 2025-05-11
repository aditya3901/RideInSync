const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "Point",
    enum: ["Point"],
  },
  coordinates: {
    type: [Number],
    required: true,
    index: "2dsphere",
  },
  address: String,
  landmark: String,
  place_id: String,
});

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
      type: locationSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

officeSchema.index({ address: "2dsphere" });

/**
 * @typedef Office
 */
const Office = mongoose.model("Office", officeSchema);

module.exports = Office;
