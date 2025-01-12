const express = require("express");
const userAuthController = require("../controllers/user/userAuthController");
const userDocsController = require("../controllers/user/userDocsController");

const router = express.Router();

router.post("/register", userAuthController.register);
router.post("/login", userAuthController.login);
router.post("/logout", userAuthController.protect, userAuthController.logout);

router.route("/addDocs").post(userDocsController.addRequiredDocs);
// Change to this later
// .post(authController.protect, authController.restrictTo("admin"), docsController.addRequiredDocs);
router
  .route("/getDocs")
  .get(userAuthController.protect, userDocsController.getRequiredDocs);

router
  .route("/uploadDocs")
  .post(userAuthController.protect, userDocsController.uploadDocs);

module.exports = router;
