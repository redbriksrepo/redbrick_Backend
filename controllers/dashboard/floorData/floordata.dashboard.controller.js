const Location = require("../../../models/location/location.model");
const Proposal = require('../../../models/proposal/proposal.model');

const getFloorData = async (req, res, next) => {
  try {
    const locationName = req.params.locationName; // Location name from the URL parameter
    const centerName = req.params.centerName; // Center name from the URL parameter

    // Search for floors that match the given location and center names
    const floors = await Location.find({ location: locationName, center: centerName }).select('floor selectedNoOfSeats totalNoOfWorkstation bookingPriceUptilNow totalProposals rackRate currentRackRate systemPrice');
    
    if (floors.length === 0) {
      return res.status(404).json({ message: "No floors found for the given location and center names." });
    }
    
    // Initialize the finalized proposal count object
    const finalizedProposal = {
      status: "Completed and Locked",
      count: 0,
    };

    // Format the data into the desired structure
    floors.map(async (floor) => {
      // Count the number of proposals with the given status for the same location, center, and floor
      const proposalCount = await Proposal.countDocuments({
        location: locationName,
        center: centerName,
        floor: floor.floor,
        status: finalizedProposal.status,
      });

      // Update the count in the finalizedProposal object
      finalizedProposal.count = proposalCount;
      console.log(finalizedProposal)
      let data = [{
        floorName: floor.floor,
        floorData: {
          systemPrice: floor.systemPrice,
          selectedNoOfSeats: floor.selectedNoOfSeats,
          totalNoOfWorkstation: floor.totalNoOfWorkstation,
          bookingPriceUptilNow: floor.bookingPriceUptilNow,
          totalProposals: floor.totalProposals,
          rackRate: floor.rackRate,
          currentRackRate: floor.currentRackRate,
          finalizedProposal:proposalCount
        },
      }];
      res.json({ data });
    });
    
    // Send the formatted data along with the finalizedProposal object as a JSON response
    
  } catch (error) {
    // Handle errors appropriately (e.g., send an error response)
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = getFloorData;
