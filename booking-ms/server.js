require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");
const app = require("./app");
const rideAssignmentCron = require("./utils/rideAssignmentCron");

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("DB connection successful");

    // Start the ride assignment cron job
    // rideAssignmentCron.start();
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Booking service is running on port ${PORT}`);
});
