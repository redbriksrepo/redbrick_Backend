const express = require('express');
const router = express.Router();
const Location = require("../../../models/location/location.model"); // Update the path accordingly

// Create a new record with layoutBorder data
const addLayoutData = async (req,res,next) => {
    // console.log(req.body)
    try {
        const locationId = req.params.Id;
        const data = req.body; // Assuming you'll send locationId and layoutBorderData in the request body
 
        // Find the location by its ID
        console.log(locationId)
        
        const location = await Location.findById(locationId);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        // Update the layoutBorder field with the provided data
        console.log(data)
        location.layoutBorder =data.LayoutData;

        // Save the updated location
        const updatedLocation = await location.save();

        res.status(200).json({ message: 'Layout border data added successfully', location: updatedLocation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = addLayoutData;
