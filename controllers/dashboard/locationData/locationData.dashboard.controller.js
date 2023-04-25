const { default: mongoose } = require("mongoose");
const Location = require("../../../models/location/location.model");

const getLocationData = (req, res, next) => {
    try {
        const currentUser = req.user;
        const findLocation = () => {
            if (currentUser.role === 'admin') {
                return Location.find().select('location center availableNoOfWorkstation totalNoOfWorkstation')
            }
            else if(currentUser.role === 'sales head') {
                return Location.find().select('location center availableNoOfWorkstation totalNoOfWorkstation').where('salesHead').equals(mongoose.Types.ObjectId(currentUser._id))
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
                locations.forEach((element) => {
                    let position = locationData.findIndex((e) => e.location === element.location);
                    // console.log(position)
                    if (position >= 0) {
                        let i = locationData.findIndex((e) => e.location === element.location);
                        locationData[i] = {
                            ...locationData[i],
                            availableNoOfWorkstation: element.availableNoOfWorkstation + locationData[i].availableNoOfWorkstation,
                            totalNoOfWorkstation: element.totalNoOfWorkstation + locationData[i].totalNoOfWorkstation,
                            centers: [
                                ...locationData[i].centers,
                                {
                                    _id: element._id,
                                    name: element.center,
                                    availableNoOfWorkstation: element.availableNoOfWorkstation,
                                    totalNoOfWorkstation: element.totalNoOfWorkstation
                                }
                            ]
                        }
                    }
                    else {
                        let temp = {
                            location: element.location,
                            availableNoOfWorkstation: element.availableNoOfWorkstation,
                            totalNoOfWorkstation: element.totalNoOfWorkstation,
                            centers: [
                                {
                                    _id: element._id,
                                    name: element.center,
                                    availableNoOfWorkstation: element.availableNoOfWorkstation,
                                    totalNoOfWorkstation: element.totalNoOfWorkstation
                                }
                            ]
                        }

                        locationData = [...locationData, temp]
                    }
                    locationList.add(element.location);
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