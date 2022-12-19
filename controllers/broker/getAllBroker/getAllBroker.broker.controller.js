const Broker = require("../../../models/broker/broker.model");

const getAllBroker = (req, res, next) => {
    Broker.find().then((brokerData) => {
        if (!brokerData) {
            let error = new Error('Something went wrong');
            throw error;
        }
        else {
            res.status(200).send(brokerData);
        }
    }).catch((err) => {
        if (!err.message) err.message = 'Something went wrong';
        if (!err.status) err.status = 400;
        return next(err);
    })
}

module.exports = getAllBroker;