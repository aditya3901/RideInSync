const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const httpStatus = require("http-status");

const config = require("./config/env.config");
const logger = require("./config/logger");
const routes = require("./api/routes");
const errorHandler = require("./api/middlewares/error.middleware");
const ApiError = require("./utils/ApiError");

// Initialize express app
const app = express();

// Set security HTTP headers
app.use(helmet());

// Parse JSON request body
app.use(express.json());

// Sanitize request data
app.use(xss());
app.use(mongoSanitize());

// Request logging
if (config.env !== "production") {
  app.use(morgan("dev"));
} else {
  // Use winston stream in production
  app.use(morgan("combined", { stream: logger.stream }));
}

// API routes
app.use("/", routes);

// Service health check
app.get("/health", (req, res) => {
  res.status(httpStatus.OK).send({
    status: "success",
    message: "Booking service is healthy",
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(
    new ApiError(
      `Cannot find ${req.originalUrl} on this server!`,
      httpStatus.NOT_FOUND
    )
  );
});

// Global error handler
app.use(errorHandler);

module.exports = app;
