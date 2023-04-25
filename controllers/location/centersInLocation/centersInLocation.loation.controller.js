const Location = require("../../../models/location/location.model")


const getCentersInLocation = (req, res, next) => {
    try {
        let location = req.params.location;
        if (!location) {
            let error = new Error('location not provided');
            error.status = 400;
            throw error;
        }
        // console.log(location);
        Location.find().select('center').where('location').equals(location).then((centersInLocation) => {
            if (!centersInLocation) {
                let error = new Error('Error while getting all the centers in selected location');
                error.status = 503;
                throw error;
            }
            else {
                res.status(200).send(centersInLocation);
            }
        }).catch((err) => {
            if (!err.message) err.message = 'Error while getting all the centers in selected location';
            if (!err.status) err.status = 503;
            next(err);
        })
    }
    catch (err) {
        if (!err.message) err.message = 'Error while getting all the centers in selected location';
        if (!err.status) err.status = 503;
        throw err;
    }
}

module.exports = getCentersInLocation;