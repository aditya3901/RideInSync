const express = require("express");
const { userController, userDocsController } = require("../controllers");
const auth = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { userValidation, docsValidation } = require("../validators");

const router = express.Router();

router.post(
  "/register",
  validate(userValidation.register),
  userController.register
);
router.post("/login", validate(userValidation.login), userController.login);
router.post("/logout", auth(), userController.logout);

// Protected routes
router.use(auth());

router.get("/details", userController.getDetails);
router
  .route("/address")
  .post(validate(userValidation.setAddress), userController.setUserAddress)
  .get(validate(userValidation.getAddress), userController.getUserAddress);

router
  .route("/docs/required")
  .post(
    validate(docsValidation.addRequiredDoc),
    userDocsController.addRequiredDocs
  )
  .get(userDocsController.getRequiredDocs);

router.post(
  "/docs/upload",
  validate(docsValidation.uploadDoc),
  userDocsController.uploadDocs
);

module.exports = router;
