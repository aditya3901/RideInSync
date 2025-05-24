const express = require("express");
const { driverController, driverDocsController } = require("../controllers");
const auth = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { driverValidation, docsValidation } = require("../validators");

const router = express.Router();

router.post(
  "/register",
  validate(driverValidation.register),
  driverController.register
);
router.post("/login", validate(driverValidation.login), driverController.login);
router.post("/logout", driverController.logout);

// Protected routes
router.use(auth());

router.get("/details", driverController.getDetails);
router.patch(
  "/online-status",
  validate(driverValidation.updateOnlineStatus),
  driverController.updateOnlineStatus
);
router.patch(
  "/location",
  validate(driverValidation.updateLocation),
  driverController.updateLocation
);

router
  .route("/docs/required")
  .post(
    validate(docsValidation.addRequiredDoc),
    driverDocsController.addRequiredDocs
  )
  .get(driverDocsController.getRequiredDocs);

router.post(
  "/docs/upload",
  validate(docsValidation.uploadDoc),
  driverDocsController.uploadDocs
);

module.exports = router;
