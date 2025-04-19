const express = require("express");
const companyRoutes = require("./company.routes");
const officeRoutes = require("./office.routes");
const timeslotRoutes = require("./timeslot.routes");

const router = express.Router();

/**
 * API Routes
 */
router.use("/companies", companyRoutes);
router.use("/offices", officeRoutes);
router.use("/timeslots", timeslotRoutes);

module.exports = router;
