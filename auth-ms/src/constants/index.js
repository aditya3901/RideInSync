/**
 * Application constants
 */
const constants = {
  // User roles
  roles: {
    USER: "user",
    DRIVER: "driver",
    ADMIN: "admin",
  },

  // Document types
  docTypes: {
    ID_PROOF: "id_proof",
    ADDRESS_PROOF: "address_proof",
    LICENSE: "license",
    VEHICLE_RC: "vehicle_rc",
    VEHICLE_INSURANCE: "vehicle_insurance",
  },

  // Address types
  addressTypes: {
    PRIMARY: "primary",
    SECONDARY: "secondary",
  },

  // Device types
  deviceTypes: {
    ANDROID: "android",
    IOS: "ios",
    WEB: "web",
  },
};

module.exports = constants;
