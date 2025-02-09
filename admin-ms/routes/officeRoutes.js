const express = require("express");
const officeController = require("../controllers/office_controller");

const router = express.Router();

router.post("/addOffice", officeController.addOffice);
router.post("/addTimeslots", officeController.addTimeslots);
router.get("/getOffice/:company/:city", officeController.getOffice);
router.get("/getTimeslots/:company/:type", officeController.getTimeslots);

module.exports = router;
