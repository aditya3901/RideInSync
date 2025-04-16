const express = require("express");
const officeController = require("../controllers/officeController");
const timeslotController = require("../controllers/timeslotController");

const router = express.Router();

router.post("/addCompany", officeController.addCompany);
router.get("/getAllCompany", officeController.getAllCompanies);

router.post("/addOffice", officeController.addOffice);
router.get("/getOffice", officeController.getNearbyOffices);

router.post("/addTimeslots", timeslotController.addAdminSlots);
router.get("/getTimeslots", timeslotController.getTimeslots);
router.post("/updateTimeslot/:timeslotId", timeslotController.updateTimeslot);

module.exports = router;
