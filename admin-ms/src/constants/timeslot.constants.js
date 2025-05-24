/**
 * Timeslot type constants
 * @enum {string}
 */
const TimeslotType = {
  LOGIN: "login",
  LOGOUT: "logout",
};

/**
 * Default slot values
 */
const DefaultSlotValues = {
  DEFAULT_CAPACITY: 10,
  MIN_FUTURE_HOURS: 1,
};

module.exports = {
  TimeslotType,
  DefaultSlotValues,
};
