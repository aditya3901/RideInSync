const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

dotenv.config({ path: path.join(__dirname, "../../config.env") });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    PORT: Joi.number().default(3001),
    MONGODB_URL: Joi.string().required().description("MongoDB connection URL"),
    JWT_SECRET: Joi.string().required().description("JWT secret key"),
    JWT_EXPIRES_IN: Joi.string().required().description("JWT expiration time"),
    LOG_LEVEL: Joi.string()
      .valid("error", "warn", "info", "debug")
      .default("info"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
  },
  logLevel: envVars.LOG_LEVEL || "info",
};
