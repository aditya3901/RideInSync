const axios = require("axios");
const geolib = require("geolib");
const logger = require("../config/logger");
const config = require("../config/env.config");
const { ClusteringConstants } = require("../constants/ride.constants");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

/**
 * Service to calculate route similarity and manage route-related operations
 */
class RouteOverlapService {
  /**
   * Get route polyline from Google Maps Directions API
   * @param {Object} origin - Starting point with lat and lng
   * @param {Object} destination - Ending point with lat and lng
   * @returns {Promise<Array>} - Array of points representing the route
   */
  static async getRoutePolyline(origin, destination) {
    try {
      logger.debug(
        `Getting route from ${JSON.stringify(origin)} to ${JSON.stringify(
          destination
        )}`
      );

      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/directions/json",
        {
          params: {
            origin: `${origin.lat},${origin.lng}`,
            destination: `${destination.lat},${destination.lng}`,
            key: config.maps.apiKey,
          },
        }
      );

      // Check if the request was successful
      if (response.data.status !== "OK") {
        logger.error(
          `Error fetching route: ${response.data.status}, ${
            response.data.error_message || "No error message"
          }`
        );
        return [];
      }

      // Extract steps from the first route
      if (!response.data.routes || response.data.routes.length === 0) {
        logger.warn("No routes found in the response");
        return [];
      }

      const routes = response.data.routes[0];
      if (!routes.legs || routes.legs.length === 0) {
        logger.warn("No legs found in the route");
        return [];
      }

      const steps = routes.legs[0].steps;
      const points = steps.flatMap((step) => ({
        lat: step.end_location.lat,
        lng: step.end_location.lng,
      }));

      logger.debug(`Route contains ${points.length} points`);
      return points;
    } catch (error) {
      logger.error("Error in getRoutePolyline:", error);

      if (error.response && error.response.data) {
        logger.error("API response error:", error.response.data);
      }

      return [];
    }
  }

  /**
   * Compute similarity between two routes
   * @param {Array} routeA - First route as array of point objects
   * @param {Array} routeB - Second route as array of point objects
   * @param {number} [distanceThreshold=500] - Distance threshold in meters
   * @returns {number} - Similarity score between 0 and 1
   */
  static computeRouteSimilarity(
    routeA,
    routeB,
    distanceThreshold = ClusteringConstants.DISTANCE_THRESHOLD_METERS
  ) {
    // Handle empty routes
    if (!routeA?.length || !routeB?.length) {
      return 0;
    }

    let matchCount = 0;

    // Count the number of points that are close to each other
    for (const pointA of routeA) {
      for (const pointB of routeB) {
        try {
          const distance = geolib.getDistance(
            { latitude: pointA.lat, longitude: pointA.lng },
            { latitude: pointB.lat, longitude: pointB.lng }
          );

          if (distance <= distanceThreshold) {
            matchCount++;
          }
        } catch (error) {
          logger.error("Error calculating distance between points:", error);
        }
      }
    }

    // Calculate similarity score based on the minimum length of routes
    const minLength = Math.min(routeA.length, routeB.length);

    if (minLength === 0) {
      return 0;
    }

    const similarityScore = matchCount / minLength;
    logger.debug(`Route similarity score: ${similarityScore.toFixed(2)}`);

    return similarityScore;
  }

  /**
   * Cluster rides based on route similarity
   * @param {Array} rideRoutes - Array of ride-route pairs
   * @param {number} [clusterSize=4] - Maximum cluster size
   * @param {number} [similarityThreshold=0.5] - Minimum similarity threshold
   * @returns {Array} - Array of clustered rides
   */
  static clusterRides(
    rideRoutes,
    clusterSize = ClusteringConstants.DEFAULT_CLUSTER_SIZE,
    similarityThreshold = ClusteringConstants.DEFAULT_SIMILARITY_THRESHOLD
  ) {
    if (!rideRoutes || rideRoutes.length === 0) {
      logger.warn("No ride routes provided for clustering");
      return [];
    }

    logger.info(
      `Clustering ${rideRoutes.length} rides with threshold ${similarityThreshold} and max size ${clusterSize}`
    );

    const clustered = new Set();
    const clusters = [];

    // First pass: Create initial clusters based on route similarity
    for (let i = 0; i < rideRoutes.length; i++) {
      if (clustered.has(i)) continue;

      // Skip if route is empty
      if (!rideRoutes[i].route || rideRoutes[i].route.length === 0) {
        logger.debug(
          `Skipping ride ${rideRoutes[i].ride._id} with empty route`
        );
        continue;
      }

      const cluster = [rideRoutes[i]];
      clustered.add(i);

      // Find similar routes and add to cluster
      for (
        let j = 0;
        j < rideRoutes.length && cluster.length < clusterSize;
        j++
      ) {
        if (i === j || clustered.has(j)) continue;

        // Skip if route is empty
        if (!rideRoutes[j].route || rideRoutes[j].route.length === 0) continue;

        const similarity = this.computeRouteSimilarity(
          rideRoutes[i].route,
          rideRoutes[j].route
        );

        if (similarity >= similarityThreshold) {
          logger.debug(
            `Adding ride ${
              rideRoutes[j].ride._id
            } to cluster with similarity ${similarity.toFixed(2)}`
          );
          cluster.push(rideRoutes[j]);
          clustered.add(j);
        }
      }

      if (cluster.length > 0) {
        clusters.push(cluster);
      }
    }

    // Second pass: Handle unclustered rides with valid routes
    const remainingRides = [];
    for (let i = 0; i < rideRoutes.length; i++) {
      if (
        !clustered.has(i) &&
        rideRoutes[i].route &&
        rideRoutes[i].route.length > 0
      ) {
        logger.debug(
          `Creating singleton cluster for unclustered ride ${rideRoutes[i].ride._id}`
        );
        remainingRides.push([rideRoutes[i]]);
      }
    }

    const allClusters = [...clusters, ...remainingRides];
    logger.info(
      `Created ${allClusters.length} clusters from ${rideRoutes.length} rides`
    );

    return allClusters;
  }

  /**
   * Get routes for multiple ride origin-destination pairs
   * @param {Array} rides - Array of rides
   * @returns {Promise<Array>} - Array of ride-route pairs
   */
  static async getRideRoutes(rides) {
    if (!rides || rides.length === 0) {
      return [];
    }

    logger.info(`Fetching routes for ${rides.length} rides`);

    // Process rides in batches to avoid too many concurrent requests
    const batchSize = 10;
    const results = [];

    for (let i = 0; i < rides.length; i += batchSize) {
      const batch = rides.slice(i, i + batchSize);
      logger.debug(
        `Processing batch ${i / batchSize + 1} with ${batch.length} rides`
      );

      // Use Promise.allSettled to handle individual failures
      const batchPromises = batch.map(async (ride) => {
        try {
          if (
            !ride.home_location ||
            !ride.home_location.coordinates ||
            !ride.office ||
            !ride.office.location
          ) {
            logger.warn(`Ride ${ride._id} is missing location data`);
            return { ride, route: [] };
          }

          const origin = {
            lat: ride.home_location.coordinates[1], // lat is second in GeoJSON
            lng: ride.home_location.coordinates[0], // lng is first in GeoJSON
          };

          const destination = {
            lat: ride.office.location.coordinates[1],
            lng: ride.office.location.coordinates[0],
          };

          const route = await this.getRoutePolyline(origin, destination);
          return { ride, route };
        } catch (error) {
          logger.error(`Error getting route for ride ${ride._id}:`, error);
          return { ride, route: [] };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      // Filter successful results
      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          results.push(result.value);
        }
      }

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < rides.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    logger.info(
      `Successfully fetched ${
        results.filter((r) => r.route.length > 0).length
      } routes out of ${rides.length} rides`
    );
    return results;
  }

  /**
   * Geocode an address to coordinates
   * @param {string} address - Address to geocode
   * @returns {Promise<Object>} - Geocoded coordinates and place details
   */
  static async geocodeAddress(address) {
    try {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            address,
            key: config.maps.apiKey,
          },
        }
      );

      if (
        response.data.status !== "OK" ||
        !response.data.results ||
        response.data.results.length === 0
      ) {
        throw new ApiError("Failed to geocode address", httpStatus.BAD_REQUEST);
      }

      const result = response.data.results[0];
      const { lat, lng } = result.geometry.location;

      return {
        type: "Point",
        coordinates: [lng, lat], // GeoJSON format: [longitude, latitude]
        address: result.formatted_address,
        place_id: result.place_id,
      };
    } catch (error) {
      logger.error("Error geocoding address:", error);
      throw new ApiError("Failed to geocode address", httpStatus.BAD_REQUEST);
    }
  }
}

module.exports = RouteOverlapService;
