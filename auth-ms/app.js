const express = require("express");
const morgan = require("morgan");
// const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");

const userAuthRouter = require("./routes/userAuthRoutes");
const driverAuthRouter = require("./routes/driverAuthRoutes");
const commonRouter = require("./routes/commonRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const app = express();

app
  .use(morgan("dev"))
  .use(express.json())
  .use(helmet())
  .use(xss())
  .use(mongoSanitize());

// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many request from this IP, please try again in an hour!",
// });
// app.use("/", limiter);

app.get("/test", (_, res) => {
  res.status(200).send("Auth server is working");
});

app.use("/common", commonRouter);
app.use("/user", userAuthRouter);
app.use("/driver", driverAuthRouter);

app.all("*", (req, _, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
