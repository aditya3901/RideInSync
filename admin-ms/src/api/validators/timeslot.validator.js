const Joi = require("joi");
const { TimeslotType } = require("../../constants/timeslot.constants");

/**
 * Validation schemas for timeslot-related operations
 */
const timeslotValidation = {
  /**
   * Schema for getting timeslots
   */
  getTimeslots: {
    query: Joi.object().keys({
      date: Joi.date().iso().required(),
      office_id: Joi.string().required(),
      type: Joi.string()
        .valid(...Object.values(TimeslotType))
        .required(),
      userTime: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
    }),
  },

  /**
   * Schema for getting timeslots by time range
   */
  getTimeslotsByTimeRange: {
    query: Joi.object().keys({
      start: Joi.date().iso().required(),
      end: Joi.date().iso().required(),
      office_id: Joi.string(),
      type: Joi.string().valid(...Object.values(TimeslotType)),
    }),
  },

  /**
   * Schema for adding admin slots
   */
  addAdminSlots: {
    body: Joi.object().keys({
      office: Joi.string().required(),
      login_slots: Joi.array()
        .items(
          Joi.object().keys({
            time: Joi.string()
              .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
              .required(),
            booked: Joi.number().min(0).default(0),
            total: Joi.number().min(1).required(),
          })
        )
        .min(1)
        .required(),
      logout_slots: Joi.array()
        .items(
          Joi.object().keys({
            time: Joi.string()
              .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
              .required(),
            booked: Joi.number().min(0).default(0),
            total: Joi.number().min(1).required(),
          })
        )
        .min(1)
        .required(),
    }),
  },

  /**
   * Schema for updating a timeslot
   */
  updateTimeslot: {
    params: Joi.object().keys({
      timeslotId: Joi.string().required(),
    }),
  },
};

module.exports = timeslotValidation;
