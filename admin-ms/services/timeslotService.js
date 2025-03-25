const moment = require("moment");
const Timeslot = require("../models/timeslot");
const AdminSlots = require("../models/admin_slots");

exports.getFutureTimeslots = async ({ date, office_id, type, userTime }) => {
  const thresholdTime = moment(userTime, "HH:mm")
    .add(1, "hours")
    .format("HH:mm");

  // Step 1: Look for existing timeslots for given date
  const timeslots = await Timeslot.find({
    date,
    office: office_id,
    type,
    time: { $gte: thresholdTime },
  });

  if (timeslots.length > 0) {
    return timeslots;
  }

  // Step 2: Fetch from AdminSlots if none found
  const adminSlots = await AdminSlots.findOne({ office: office_id });
  if (!adminSlots) return [];

  const slotsToCreate =
    type === "login" ? adminSlots.login_slots : adminSlots.logout_slots;

  const filteredSlots = slotsToCreate.filter(
    (slot) => slot.time >= thresholdTime
  );

  if (filteredSlots.length === 0) return [];

  // Step 3: Add timeslots to Timeslot DB for given date
  const newTimeslots = await Timeslot.insertMany(
    filteredSlots.map((slot) => ({
      office: office_id,
      type,
      date,
      time: slot.time,
      booked: slot.booked,
      total: slot.total,
    }))
  );

  return newTimeslots;
};

exports.addAdminSlots = async ({ office, login_slots, logout_slots }) => {
  return await AdminSlots.create({ office, login_slots, logout_slots });
};
