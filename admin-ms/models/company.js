const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
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
});

module.exports = mongoose.model("Company", companySchema);
