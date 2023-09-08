

const Location = require("../../../models/location/location.model");

const getFloorData = async (req, res, next) => {
  try {
    const locationName = req.params.locationName; // Location name from the URL parameter
    const centerName = req.params.centerName; // Center name from the URL parameter

    // Search for floors that match the given location and center names
    const floors = await Location.find({ location: locationName, center: centerName }).distinct('floor');

    if (floors.length === 0) {
      return res.status(404).json({ message: "No floors found for the given location and center names." });
    }

    // Send the floors as a JSON response
    res.json({ floors });
  } catch (error) {
    // Handle errors appropriately (e.g., send an error response)
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = getFloorData;