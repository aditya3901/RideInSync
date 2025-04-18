const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/env.config");
const logger = require("./config/logger");
const rideAssignmentJob = require("./jobs/rideAssignment.job");

// Handling uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  logger.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Connect to MongoDB
mongoose
  .connect(config.mongoose.url)
  .then(() => {
    logger.info("Connected to MongoDB");

    // Start the server
    const server = app.listen(config.port, () => {
      logger.info(
        `Booking service running on port ${config.port} in ${config.env} mode`
      );
    });

    // Start the ride assignment cron job
    if (config.env !== "test") {
      // rideAssignmentJob.start();
    }

    // Handling unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
      logger.error(err.name, err.message, err.stack);

      // Graceful shutdown
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle SIGTERM signal
    process.on("SIGTERM", () => {
      logger.info("👋 SIGTERM RECEIVED. Shutting down gracefully");
      server.close(() => {
        logger.info("💥 Process terminated!");
      });
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  });
