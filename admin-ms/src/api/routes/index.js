const express = require("express");
const companyRoutes = require("./company.routes");
const officeRoutes = require("./office.routes");
const timeslotRoutes = require("./timeslot.routes");

const router = express.Router();

/**
 * API Routes
 */
router.use("/company", companyRoutes);
router.use("/office", officeRoutes);
router.use("/timeslots", timeslotRoutes);

module.exports = router;
