const express = require("express");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const adminRouter = require("./routes/adminRoutes");
const app = express();

app
  .use(morgan("dev"))
  .use(express.json())
  .use(helmet())
  .use(xss())
  .use(mongoSanitize());

app.get("/test", (_, res) => {
  res.status(200).send("Admin server is working");
});

app.use("/", adminRouter);

app.all("*", (req, _, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
