const { default: mongoose } = require("mongoose");
const Location = require("../../../models/location/location.model");

const getLocationData = (req, res, next) => {
    try {

        const currentUser = req.user;
        const findLocation = () => {
            if (currentUser.role === 'admin') {
                return Location.find().select('location center availableNoOfWorkstation systemPrice totalNoOfWorkstation selectedNoOfSeats rentAndCamTotal rackRate bookingPriceUptilNow totalProposals futureRackRate currentRackRate')
            }
            else if(currentUser.role === 'sales head') {
                return Location.find().select('location center availableNoOfWorkstation systemPrice totalNoOfWorkstation selectedNoOfSeats rentAndCamTotal rackRate bookingPriceUptilNow totalProposals futureRackRate currentRackRate').where('salesHead').equals(mongoose.Types.ObjectId(currentUser._id))
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
                let locationList = new Set();
                let locationData = [];
               
                locations = JSON.parse(JSON.stringify(locations));
                // console.log(locations)\
                locations.forEach((element) => {
                    // console.log(locations)
                    let position = locationData.findIndex((e) => e.location === element.location);
                    // console.log(position)
                    if (position >= 0) {
                        let i = locationData.findIndex((e) => e.location === element.location);
                        // console.log("HeloOOOOOOOOOOOOOOOOOOOOOOo",locationData[i]);
                        locationData[i] = {
                            ...locationData[i],
                            availableNoOfWorkstation: element.availableNoOfWorkstation + locationData[i].availableNoOfWorkstation,
                            totalNoOfWorkstation: element.totalNoOfWorkstation + locationData[i].totalNoOfWorkstation,
                            selectedNoOfSeats: element.selectedNoOfSeats+ locationData[i].selectedNoOfSeats,
                            systemPrice: element.systemPrice + locationData[i].systemPrice,
                            bookingPriceUptilNow:element.bookingPriceUptilNow + locationData[i].bookingPriceUptilNow,
                            totalProposals:element.totalProposals + locationData[i].totalProposals,
                            
                            centers: [
                                ...locationData[i].centers,
                                {
                                    _id: element._id,
                                    name: element.center,
                                    availableNoOfWorkstation: element.availableNoOfWorkstation,
                                    totalNoOfWorkstation: element.totalNoOfWorkstation,
                                    selectedNoOfSeats: element.selectedNoOfSeats,
                                    systemPrice: element.systemPrice,
                                    rackRate:element.rackRate,
                                    rentAndCamTotal: element.rentAndCamTotal,
                                    bookingPriceUptilNow:element.bookingPriceUptilNow,
                                    totalProposals:element.totalProposals,
                                    futureRackRate:element.futureRackRate,
                                    currentRackRate:element.currentRackRate
                                }
                            ]
                        }
                    }
                    else {
                        // console.log(element)
                        let temp = {
                            location: element.location,
                            availableNoOfWorkstation: element.availableNoOfWorkstation,
                            totalNoOfWorkstation: element.totalNoOfWorkstation,
                            selectedNoOfSeats: element.selectedNoOfSeats,
                            systemPrice : element.systemPrice,
                            bookingPriceUptilNow:element.bookingPriceUptilNow,
                            totalProposals:element.totalProposals,
                            centers: [
                                {
                                    _id: element._id,
                                    name: element.center,
                                    availableNoOfWorkstation: element.availableNoOfWorkstation,
                                    totalNoOfWorkstation: element.totalNoOfWorkstation,
                                    selectedNoOfSeats: element.selectedNoOfSeats,
                                    systemPrice:element.systemPrice,
                                    rackRate:element.rackRate,
                                    rentAndCamTotal: element.rentAndCamTotal,
                                    bookingPriceUptilNow:element.bookingPriceUptilNow,
                                    totalProposals:element.totalProposals,
                                    futureRackRate:element.futureRackRate,
                                    currentRackRate:element.currentRackRate
                                }
                            ]
                        }

                        locationData = [...locationData, temp]
                    }
                    locationList.add(element.location);
                    // console.log(locationData)
                });
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