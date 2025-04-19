const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    offices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Office",
      },
    ],
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef Company
 */
const Company = mongoose.model("Company", companySchema);

module.exports = Company;
