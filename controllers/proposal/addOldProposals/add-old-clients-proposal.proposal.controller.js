const Proposal = require("../../../models/proposal/proposal.model");
const Location = require("../../../models/location/location.model");
const { default: mongoose } = require("mongoose");
const addOldClientProposals = (req, res, next) => {
  try {
    const data = req.body;
    // var Id
    Location.findOne({ location: data.location }, { center: 1 }).then(
      (result) => {
        if (!result) {
          let error = new Error("Error getting center");
          error.status = 503;
          throw error;
        } else {
          let date = new Date();
          let Id = `RBO${String(data.location).toUpperCase().slice(0, 2)}${String(result.center).toUpperCase().slice(0, 2)}${("0" + date.getDate() ).slice(-2)}${("0" + (date.getMonth() + 1)).slice(-2)}${("0" + date.getHours()).slice(-2)}${("0" + date.getMinutes()).slice(-2)}`;
          const proposal = new Proposal({
            _id: String(Id),
            clientName: data.clientName,
            location: data.location,
            locationId:data.locationId,
            center: data.center,
            floor: data.floor,
            finalOfferAmmount: data.finalOfferAmmount,
            salesPerson: mongoose.Types.ObjectId(data.salesPerson),
            salesHead: mongoose.Types.ObjectId(data.salesHead),
            tenure: data.tenure,
            lockIn: data.lockIn,
            depositTerm: data.depositTerm,
            noticePeriod: data.noticePeriod,
            rentCommencmentDate: data.rentCommencmentDate,
            NonStandardRequirement: data.NonStandardRequirement,
            Serviced: data.Serviced,
            totalNumberOfSeats: data.totalNumberOfSeats,
            color:data.color,
            seatSize:data.seatSize,
            seatsData:data.seatsData,
            status:data.status

          });
          proposal.save().then((result) => {
            res.send(result);
          });
        } // res.send(result)
      }
    ); // res.send(data.location)
  } catch (err) {
    if (!err.status) err.status = 500;
    if (!err.message) err.message = "Error while submitting";
    throw err;
  }
};
module.exports = addOldClientProposals;
