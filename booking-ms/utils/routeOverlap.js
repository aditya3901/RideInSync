const axios = require("axios");
const geolib = require("geolib");

/**
 * Get route polyline from Google Maps Directions API
 * @param {Object} origin Starting point with lat and lng
 * @param {Object} destination Ending point with lat and lng
 * @returns {Array} Array of points representing the route
 */
const getRoutePolyline = async (origin, destination) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json`,
      {
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.status !== "OK") {
      console.error("Error fetching route:", response.data.status);
      return [];
    }

    const steps = response.data.routes[0].legs[0].steps;
    return steps.flatMap((step) => ({
      lat: step.end_location.lat,
      lng: step.end_location.lng,
    }));
  } catch (error) {
    console.error("Error in getRoutePolyline:", error);
    return [];
  }
};

/**
 * Compute similarity between two routes
 * @param {Array} routeA First route as array of point objects
 * @param {Array} routeB Second route as array of point objects
 * @returns {Number} Similarity score between 0 and 1
 */
const computeRouteSimilarity = (routeA, routeB) => {
  if (!routeA.length || !routeB.length) return 0;

  let matchCount = 0;

  for (const pointA of routeA) {
    for (const pointB of routeB) {
      const distance = geolib.getDistance(
        { latitude: pointA.lat, longitude: pointA.lng },
        { latitude: pointB.lat, longitude: pointB.lng }
      );
      if (distance <= 500) matchCount++;
    }
  }

  const minLength = Math.min(routeA.length, routeB.length);
  return matchCount / minLength;
};

module.exports = { getRoutePolyline, computeRouteSimilarity };
