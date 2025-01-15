require("dotenv").config({ path: "./config.env" });
const express = require("express");
const proxy = require("express-http-proxy");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

app.use(morgan("dev"));
app.get("/test", (_, res) => {
  res.status(200).send("Gateway server is working");
});

app.use("/auth", proxy(AUTH_SERVICE_URL));

app.use((_, res) => {
  res.status(404).send("Not Found");
});

app.listen(PORT, () => {
  console.log(`Gateway server is running on http://localhost:${PORT}`);
});
