
const Proposal = require("../../../models/proposal/proposal.model")
const sendImageData = async(req, res, next) => {
    const proposalId = req.params.Id;
    const data = req.body;
    const drawnSeats= data.drawnSeats;
    const seatSize = data.seatSize
  console.log(seatSize)
    try {
      const proposal = await Proposal.findByIdAndUpdate(proposalId,
        { $set: { imageDataOfLayout: data.image, seatsData:drawnSeats,seatSize:seatSize } }
        // { new: true }
      );
  
      if (!proposal) {
        return res.status(404).json({ message: 'Proposal not found.' });
      }
  
      return res.status(200).json({ message: 'Image data saved successfully.' });
    } catch (error) {
      console.error('Error saving image data:', error);
      return res.status(500).json({ message: 'Internal server error.'});
    }
  };
  module.exports = sendImageData;