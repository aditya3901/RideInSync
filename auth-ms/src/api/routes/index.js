const express = require("express");
const userRoutes = require("./user.routes");
const driverRoutes = require("./driver.routes");
const commonRoutes = require("./common.routes");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/driver",
    route: driverRoutes,
  },
  {
    path: "/common",
    route: commonRoutes,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
