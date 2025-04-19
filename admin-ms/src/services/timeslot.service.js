const moment = require("moment");
const httpStatus = require("http-status");
const { Timeslot, AdminSlots, Office } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Get future timeslots for an office
 * @param {Object} params
 * @returns {Promise<Timeslot[]>}
 */
const getFutureTimeslots = async (params) => {
  const { date, office_id, type, userTime } = params;

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

/**
 * Add admin slots for an office
 * @param {Object} slotData
 * @returns {Promise<AdminSlots>}
 */
const addAdminSlots = async (slotData) => {
  const { office } = slotData;

  // Verify that the office exists
  const officeExists = await Office.findById(office);
  if (!officeExists) {
    throw new ApiError("Office not found", httpStatus.NOT_FOUND);
  }

  // Check if slots already exist for this office
  const existingSlots = await AdminSlots.findOne({ office });
  if (existingSlots) {
    throw new ApiError(
      "Slots already exist for this office",
      httpStatus.BAD_REQUEST
    );
  }

  return AdminSlots.create(slotData);
};

/**
 * Update a timeslot (increment booked count)
 * @param {Object} params
 * @returns {Promise<Timeslot>}
 */
const updateTimeslot = async (params) => {
  const { timeslotId } = params;

  const timeslot = await Timeslot.findById(timeslotId);
  if (!timeslot) {
    throw new ApiError("Timeslot not found", httpStatus.NOT_FOUND);
  }

  if (timeslot.booked >= timeslot.total) {
    throw new ApiError("Timeslot is fully booked", httpStatus.BAD_REQUEST);
  }

  return Timeslot.findByIdAndUpdate(
    timeslotId,
    { $inc: { booked: 1 } },
    { new: true }
  );
};

module.exports = {
  getFutureTimeslots,
  addAdminSlots,
  updateTimeslot,
};
