const axios = require("axios");
const httpStatus = require("http-status");
const logger = require("../config/logger");
const config = require("../config/env.config");
const ApiError = require("./ApiError");

// Create axios instance with defaults
const httpClient = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for logging
httpClient.interceptors.request.use(
  (config) => {
    logger.debug(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
httpClient.interceptors.response.use(
  (response) => {
    logger.debug(
      `API Response: ${response.status} from ${response.config.url}`
    );
    return response;
  },
  (error) => {
    if (error.response) {
      logger.error(
        `API Error: ${error.response.status} from ${error.config.url}`,
        {
          data: error.response.data,
        }
      );
    } else {
      logger.error("API Error:", error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Service for making HTTP requests to other microservices
 */
class HttpService {
  /**
   * Make a request to the Gateway Service with service token
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} params - URL parameters
   * @param {string} token - User's authentication token (if available)
   * @returns {Promise<Object>} Response data
   */
  static async gatewayRequest(
    method,
    endpoint,
    data = {},
    params = {},
    token = null
  ) {
    try {
      const url = `${config.services.gateway}${endpoint}`;

      // Use service token if user token not provided
      const authToken = token || config.auth.serviceToken;

      const response = await httpClient({
        method,
        url,
        data,
        params,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        // Extract error details from the response
        const { status, data } = error.response;

        // Create a more descriptive error message
        const message = data.message || `Gateway service error: ${status}`;

        throw new ApiError(message, status);
      }

      // Network or other errors
      throw new ApiError(
        `Failed to communicate with gateway service: ${error.message}`,
        httpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * GET request to gateway service
   */
  static async get(endpoint, params = {}, token = null) {
    return this.gatewayRequest("get", endpoint, {}, params, token);
  }

  /**
   * POST request to gateway service
   */
  static async post(endpoint, data = {}, token = null) {
    return this.gatewayRequest("post", endpoint, data, {}, token);
  }

  /**
   * PUT request to gateway service
   */
  static async put(endpoint, data = {}, token = null) {
    return this.gatewayRequest("put", endpoint, data, {}, token);
  }

  /**
   * DELETE request to gateway service
   */
  static async delete(endpoint, token = null) {
    return this.gatewayRequest("delete", endpoint, {}, {}, token);
  }
}

module.exports = HttpService;
