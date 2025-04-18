const winston = require("winston");
const config = require("./env.config");

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define transport options based on environment
const transports = [];

// Always log to console
transports.push(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        (info) =>
          `${info.timestamp} ${info.level}: ${info.message}${
            info.stack ? `\n${info.stack}` : ""
          }`
      )
    ),
  })
);

// In production, also log to a file
if (config.env === "production") {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: logFormat,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: logFormat,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: config.logLevel,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Stream for Morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
