const mongoose = require('mongoose');
const Location = require('../../../models/location/location.model');

const updateRackValueController = (req, res, nex) => {
    try {

        let { systemPrice, rackRate, _id, systemPriceNS, rackRateNS } = req.body;
        if (!systemPrice && !rackRate, !_id) {
            let error = new Error('systemPrice and rackRate and id field is required');
            error.status = 400;
            throw error;
        }
        Location.findByIdAndUpdate(mongoose.Types.ObjectId(_id), { $set: { systemPrice, rackRate, systemPriceNS, rackRateNS  } }, { rawResult: true }).then((updateResult) => {
            if (updateResult.lastErrorObject.updatedExisting) {
                res.status(200).send({
                    "Message": "Rent and Cam value added successfully"
                });
            }
            else {
                let error = new Error('Something went wrong');
                error.status = 400;
                throw error;
            }
        }).catch(err => {
            if(!err.message) err.message = 'Something went wrong';
            if(!err.status) err.status = 500;
            next(err);
        })

    }
    catch (err) {
        if(!err.message) err.message = 'Something went wrong';
        if(!err.status) err.status = 500;
        throw err;
    }
}

module.exports = updateRackValueController;
