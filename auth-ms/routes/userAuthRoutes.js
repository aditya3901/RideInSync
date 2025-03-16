const express = require("express");
const userAuthController = require("../controllers/user/userAuthController");
const userDocsController = require("../controllers/user/userDocsController");

const router = express.Router();

router.post("/register", userAuthController.register);
router.post("/login", userAuthController.login);
router.post("/logout", userAuthController.protect, userAuthController.logout);

router.use(userAuthController.protect);

router.use("/details", userAuthController.getDetails);
router
  .route("/address")
  .post(userAuthController.setUserAddress)
  .get(userAuthController.getUserAddress);

router.route("/addDocs").post(userDocsController.addRequiredDocs);
router.route("/getDocs").get(userDocsController.getRequiredDocs);
router.route("/uploadDocs").post(userDocsController.uploadDocs);

module.exports = router;
