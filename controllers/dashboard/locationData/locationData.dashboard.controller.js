const { default: mongoose } = require("mongoose");
const Location = require("../../../models/location/location.model");

const getLocationData = (req, res, next) => {
    try {

        const currentUser = req.user;
        const findLocation = () => {
            if (currentUser.role === 'admin') {
                return Location.find().select('location center floor availableNoOfWorkstation systemPrice totalNoOfWorkstation selectedNoOfSeats rentAndCamTotal rackRate bookingPriceUptilNow totalProposals futureRackRate currentRackRate')
            }
            else if(currentUser.role === 'sales head') {
                return Location.find().select('location center floor availableNoOfWorkstation systemPrice totalNoOfWorkstation selectedNoOfSeats rentAndCamTotal rackRate bookingPriceUptilNow totalProposals futureRackRate currentRackRate').where('salesHead').equals(mongoose.Types.ObjectId(currentUser._id))
            }
            else {
                let error = new Error('not Authorized');
                error.status = 401;
                throw error;
            }
        }
        findLocation().then((locations) => {
            if (!locations) {
                let error = new Error('Something went wrong');
                throw error;
            }
            else {
             
                let locationData = [];
               
                locations = JSON.parse(JSON.stringify(locations));
                // console.log(locations)\
               // Initialize an empty object to store the structured data
const structuredData = {};

locations.forEach((element) => {
  if (!structuredData[element.location]) {
    structuredData[element.location] = {
      location: element.location,
      availableNoOfWorkstation: element.availableNoOfWorkstation,
      totalNoOfWorkstation: 0, // Initialize with 0
      selectedNoOfSeats: element.selectedNoOfSeats,
      systemPrice: element.systemPrice,
      bookingPriceUptilNow: element.bookingPriceUptilNow,
      totalProposals: element.totalProposals,
    };
  }
});

// Convert the structuredData object to an array
 locationData = Object.values(structuredData);

                res.json(locationData);
            }
        }).catch((err) => {
            if (!err.message) err.message = 'Something went wrong';
            return next(err);
        })
    }
    catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        throw err;
    }
}

module.exports = getLocationData;