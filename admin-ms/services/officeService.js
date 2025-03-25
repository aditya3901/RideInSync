const Office = require("../models/office");

exports.getNearbyOffices = async ({
  company_id,
  latitude,
  longitude,
  maxDistance,
}) => {
  return await Office.find({
    company: company_id,
    location: {
      $near: {
        $maxDistance: maxDistance,
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      },
    },
  });
};
