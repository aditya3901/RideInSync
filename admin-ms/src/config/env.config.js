const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../../config.env") });

// Define validation schema for environment variables
const envSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("development", "production", "test")
      .default("development"),
    PORT: Joi.number().default(3002),
    MONGODB_URL: Joi.string()
      .required()
      .description("MongoDB connection string"),
    JWT_SECRET: Joi.string()
      .default("secret-key")
      .description("JWT secret key"),
    GATEWAY_SERVICE_URL: Joi.string()
      .default("http://localhost:3000")
      .description("Gateway service URL"),
    SERVICE_TOKEN: Joi.string()
      .default("admin-service-token")
      .description("Service token for internal communication"),
    LOG_LEVEL: Joi.string()
      .valid("error", "warn", "info", "debug")
      .default("info"),
  })
  .unknown();

// Validate and extract environment variables
const { value: envVars, error } = envSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

// Export validated environment variables
module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
  },
  services: {
    gateway: envVars.GATEWAY_SERVICE_URL,
  },
  auth: {
    serviceToken: envVars.SERVICE_TOKEN,
  },
  logLevel: envVars.LOG_LEVEL,
};
