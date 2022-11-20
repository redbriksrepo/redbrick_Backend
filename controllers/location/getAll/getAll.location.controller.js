const Location = require("../../../models/location/location.model")


const getAllLocation = (req, res, next) => {
    Location.find().then((location) => {
        if (!location) {
            let error = new Error('Error while getting all Location data');
            error.status = 503;
            throw error;
        }
        else {
            res.status(200).send(location);
        }
    }).catch((err) => {
        if (!err.message) err.message = 'Error while getting all location data';
        if (!err.status) err.status = 503;
        next(err);
    })
}

module.exports = getAllLocation;