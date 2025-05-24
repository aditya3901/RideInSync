/**
 * Ride status constants
 * @enum {string}
 */
const RideStatus = {
  PENDING: "pending",
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

/**
 * Ride type constants
 * @enum {string}
 */
const RideType = {
  LOGIN: "login",
  LOGOUT: "logout",
};

/**
 * Clustering constants
 */
const ClusteringConstants = {
  DEFAULT_CLUSTER_SIZE: 4,
  DEFAULT_SIMILARITY_THRESHOLD: 0.5,
  DISTANCE_THRESHOLD_METERS: 500,
};

/**
 * Cancellation reason constants
 * @enum {string}
 */
const CancellationReason = {
  USER_CANCELLED: "user-cancelled",
  DRIVER_CANCELLED: "driver-cancelled",
  SYSTEM_CANCELLED: "system-cancelled",
  NO_DRIVER_AVAILABLE: "no-driver-available",
};

module.exports = {
  RideStatus,
  RideType,
  ClusteringConstants,
  CancellationReason,
};
