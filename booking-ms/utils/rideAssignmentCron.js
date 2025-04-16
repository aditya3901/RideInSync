const cron = require("node-cron");
const mongoose = require("mongoose");
const axios = require("axios");
const Ride = require("../models/ride_model");
const { getRoutePolyline, computeRouteSimilarity } = require("./routeOverlap");

/**
 * Cron job to assign rides to drivers using route clustering
 * Runs every hour and groups rides with similar routes
 */
class RideAssignmentCron {
  constructor() {
    this.isRunning = false;
    this.clusterSize = 4; // Maximum number of rides per driver
    this.similarityThreshold = 0.5; // Minimum route similarity to group rides
  }

  /**
   * Start the cron job to run every hour
   */
  start() {
    // Run every hour (at the start of each hour)
    cron.schedule("0 * * * *", async () => {
      try {
        if (this.isRunning) {
          console.log("Previous job still running, skipping this run");
          return;
        }

        this.isRunning = true;
        console.log(
          `[${new Date().toISOString()}] Starting ride assignment job`
        );

        await this.processNextTimeslot();

        this.isRunning = false;
        console.log(
          `[${new Date().toISOString()}] Ride assignment job completed`
        );
      } catch (error) {
        this.isRunning = false;
        console.error(
          `[${new Date().toISOString()}] Error in ride assignment job:`,
          error
        );
      }
    });

    console.log("Ride assignment cron job scheduled to run every hour");
  }

  /**
   * Process the next timeslot with pending rides
   */
  async processNextTimeslot() {
    // Get the next hour's timeslot
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    console.log(
      `Looking for timeslots between ${now.toISOString()} and ${oneHourLater.toISOString()}`
    );

    // Get timeslots in the next hour
    const timeslots = await this.fetchTimeslots(now, oneHourLater);

    if (!timeslots || timeslots.length === 0) {
      console.log("No upcoming timeslots found for the next hour");
      return;
    }

    console.log(`Found ${timeslots.length} timeslots in the next hour`);

    // Process each timeslot
    for (const timeslot of timeslots) {
      await this.processTimeslot(timeslot);
    }
  }

  /**
   * Fetch timeslots within a time range
   */
  async fetchTimeslots(startTime, endTime) {
    try {
      // In a real implementation, you would fetch this directly from the database
      // Here we're using the gateway service
      const response = await axios.get(
        `${process.env.GATEWAY_SERVICE_URL}/admin/timeslots`,
        {
          params: {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
          },
          headers: {
            Authorization: `Bearer ${process.env.SERVICE_TOKEN}`,
          },
        }
      );

      if (response.status === 200 && response.data.timeslots) {
        return response.data.timeslots;
      }

      return [];
    } catch (error) {
      console.error("Error fetching timeslots:", error);
      return [];
    }
  }

  /**
   * Process a single timeslot
   */
  async processTimeslot(timeslot) {
    console.log(
      `Processing timeslot: ${timeslot._id} for time ${timeslot.time}`
    );

    // Find all pending rides for this timeslot
    const rides = await Ride.find({
      timeslot: mongoose.Types.ObjectId(timeslot._id),
      type: timeslot.type,
      office: mongoose.Types.ObjectId(timeslot.office),
      status: "pending",
    }).populate("office");

    if (rides.length < 2) {
      console.log(
        `Not enough rides (${rides.length}) for clustering in timeslot ${timeslot._id}`
      );

      // If there's only one ride, assign it to a driver
      if (rides.length === 1) {
        const availableDrivers = await this.fetchAvailableDrivers();
        if (availableDrivers && availableDrivers.length > 0) {
          await this.assignRideToDriver(rides[0], availableDrivers[0]);
        }
      }
      return;
    }

    console.log(
      `Found ${rides.length} pending rides for timeslot ${timeslot._id}`
    );

    // Pre-fetch routes for all rides
    console.log("Pre-fetching routes for all rides...");
    const rideRoutes = await Promise.all(
      rides.map(async (ride) => {
        try {
          const origin = {
            lat: ride.home_location.coordinates[1], // lat is second coordinate in GeoJSON
            lng: ride.home_location.coordinates[0], // lng is first coordinate in GeoJSON
          };

          const destination = {
            lat: ride.office.location.coordinates[1],
            lng: ride.office.location.coordinates[0],
          };

          const route = await getRoutePolyline(origin, destination);
          return { ride, route };
        } catch (error) {
          console.error(`Error getting route for ride ${ride._id}:`, error);
          return { ride, route: [] };
        }
      })
    );

    console.log(
      `Successfully fetched ${
        rideRoutes.filter((r) => r.route.length > 0).length
      } routes`
    );

    // Cluster rides based on route similarity
    const clusters = this.clusterRides(rideRoutes);
    console.log(`Created ${clusters.length} ride clusters`);

    // Assign clusters to available drivers
    await this.assignClustersToDrivers(clusters);
  }

  /**
   * Cluster rides based on route similarity
   */
  clusterRides(rideRoutes) {
    const clustered = new Set();
    const clusters = [];

    for (let i = 0; i < rideRoutes.length; i++) {
      if (clustered.has(i)) continue;

      // Skip if route is empty
      if (rideRoutes[i].route.length === 0) continue;

      const cluster = [rideRoutes[i]];
      clustered.add(i);

      for (
        let j = 0;
        j < rideRoutes.length && cluster.length < this.clusterSize;
        j++
      ) {
        if (i === j || clustered.has(j)) continue;

        // Skip if route is empty
        if (rideRoutes[j].route.length === 0) continue;

        const similarity = computeRouteSimilarity(
          rideRoutes[i].route,
          rideRoutes[j].route
        );
        if (similarity >= this.similarityThreshold) {
          cluster.push(rideRoutes[j]);
          clustered.add(j);
        }
      }

      if (cluster.length > 0) {
        clusters.push(cluster);
      }
    }

    // Handle any remaining unclustered rides with valid routes
    const remainingRides = [];
    for (let i = 0; i < rideRoutes.length; i++) {
      if (!clustered.has(i) && rideRoutes[i].route.length > 0) {
        remainingRides.push([rideRoutes[i]]);
      }
    }

    return [...clusters, ...remainingRides];
  }

  /**
   * Assign ride clusters to available drivers
   */
  async assignClustersToDrivers(clusters) {
    if (clusters.length === 0) return;

    // Fetch available drivers
    const availableDrivers = await this.fetchAvailableDrivers();

    if (!availableDrivers || availableDrivers.length === 0) {
      console.log("No available drivers found for assignment");
      return;
    }

    console.log(
      `Found ${availableDrivers.length} available drivers for assignment`
    );

    // Assign each cluster to a driver while drivers are available
    for (let i = 0; i < clusters.length && i < availableDrivers.length; i++) {
      const driver = availableDrivers[i];
      const rideCluster = clusters[i];

      // Extract ride IDs from the cluster
      const rideIds = rideCluster.map((entry) => entry.ride._id);

      console.log(
        `Assigning ${rideIds.length} rides to driver ${driver.name} (ID: ${driver._id})`
      );

      // Update all rides in the cluster
      try {
        const result = await Ride.updateMany(
          { _id: { $in: rideIds } },
          {
            status: "scheduled",
            driver: driver._id,
            assignedAt: new Date(),
          }
        );

        console.log(
          `Updated ${result.modifiedCount} rides for driver ${driver._id}`
        );

        // Mark driver as unavailable using the auth service
        await this.updateDriverAvailability(driver._id, false);

        // Notify the driver about assigned rides
        await this.notifyDriver(
          driver,
          rideCluster.map((r) => r.ride)
        );
      } catch (error) {
        console.error(`Error assigning rides to driver ${driver._id}:`, error);
      }
    }
  }

  /**
   * Assign a single ride to a driver
   */
  async assignRideToDriver(ride, driver) {
    try {
      await Ride.updateOne(
        { _id: ride._id },
        {
          status: "scheduled",
          driver: driver._id,
          assignedAt: new Date(),
        }
      );

      console.log(`Assigned single ride ${ride._id} to driver ${driver._id}`);

      // Mark driver as unavailable
      await this.updateDriverAvailability(driver._id, false);

      // Notify driver
      await this.notifyDriver(driver, [ride]);
    } catch (error) {
      console.error(
        `Error assigning ride ${ride._id} to driver ${driver._id}:`,
        error
      );
    }
  }

  /**
   * Update driver availability status
   */
  async updateDriverAvailability(driverId, isAvailable) {
    try {
      await axios.put(
        `${process.env.GATEWAY_SERVICE_URL}/auth/drivers/${driverId}/availability`,
        { isAvailable },
        {
          headers: {
            Authorization: `Bearer ${process.env.SERVICE_TOKEN}`,
          },
        }
      );

      console.log(`Updated driver ${driverId} availability to ${isAvailable}`);
    } catch (error) {
      console.error(`Error updating driver ${driverId} availability:`, error);
    }
  }

  /**
   * Fetch available drivers from auth service
   */
  async fetchAvailableDrivers() {
    try {
      const response = await axios.get(
        `${process.env.GATEWAY_SERVICE_URL}/auth/drivers/available`,
        {
          headers: {
            Authorization: `Bearer ${process.env.SERVICE_TOKEN}`,
          },
        }
      );

      if (response.status === 200 && response.data.drivers) {
        return response.data.drivers;
      }

      return [];
    } catch (error) {
      console.error("Error fetching available drivers:", error);
      return [];
    }
  }

  /**
   * Notify a driver about assigned rides
   */
  async notifyDriver(driver, rides) {
    // In a real implementation, you would send push notifications to the driver
    console.log(
      `Notifying driver ${driver.name} (ID: ${driver._id}) about ${rides.length} assigned rides`
    );

    // Log notification details for each ride
    rides.forEach((ride) => {
      console.log(
        `  - Ride ID: ${ride._id}, Type: ${ride.type}, Office: ${ride.office}`
      );
    });
  }
}

module.exports = new RideAssignmentCron();
