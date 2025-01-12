const express = require("express");
const driverAuthController = require("../controllers/driver/driverAuthController");
const driverDocsController = require("../controllers/driver/driverDocsController");

const router = express.Router();

router.post("/register", driverAuthController.register);
router.post("/login", driverAuthController.login);
router.post("/logout", driverAuthController.logout);

router.use(driverAuthController.protect);

router.route("/addDocs").post(driverDocsController.addRequiredDocs);
router.route("/getDocs").get(driverDocsController.getRequiredDocs);
router.route("/uploadDocs").post(driverDocsController.uploadDocs);

module.exports = router;
