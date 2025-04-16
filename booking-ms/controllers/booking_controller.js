const { promisify } = require("util");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Ride = require("../models/ride_model");

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in!", 401));
  }

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid or expired token!",
    });
  }
});

exports.bookRide = catchAsync(async (req, res, next) => {
  const { isLogin, date, office_id, timeslot_id, home_type } = req.body;
  const user_id = req.user.id;

  try {
    const timeslotResponse = await axios.post(
      `${process.env.GATEWAY_SERVICE_URL}/admin/updateTimeslot/${timeslot_id}`,
      {
        headers: {
          Authorization: `Bearer ${req.token}`,
        },
      }
    );

    if (timeslotResponse.status !== 200) {
      return next(new AppError("Failed to update timeslot", 500));
    }

    const homeResponse = await axios.get(
      `${process.env.GATEWAY_SERVICE_URL}/auth/user/address?type=${home_type}`,
      {
        headers: {
          Authorization: `Bearer ${req.token}`,
        },
      }
    );

    if (homeResponse.status !== 200) {
      return next(new AppError("Failed to fetch home address", 500));
    }
    const home_address = homeResponse.data.address;

    const ride = await Ride.create({
      user: user_id,
      office: office_id,
      timeslot: timeslot_id,
      date,
      type: isLogin ? "login" : "logout",
      home_location: {
        type: "Point",
        coordinates: home_address.coordinates,
        address: home_address.address,
        landmark: home_address.landmark,
        place_id: home_address.place_id,
      },
    });

    return res.status(201).json({
      status: "success",
      data: {
        ride,
      },
    });
  } catch (error) {
    return next(new AppError("Failed to book ride", 500));
  }
});
