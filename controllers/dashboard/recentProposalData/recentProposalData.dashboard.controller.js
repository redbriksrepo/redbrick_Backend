const Proposal = require('../../../models/proposal/proposal.model')
const Location = require('../../../models/location/location.model')
const mongoose = require('mongoose')

const recentProposalData = (req, res, next) => {
    const id = req.params.Id;
    try {
        Proposal.findOne({ _id: id }, { location: 1, center: 1, floor: 1, locationId: 1, clientFinalOfferAmmount: 1, totalNumberOfSeats: 1 })
            .then((data) => {
                if (!data) {
                    return res.status(401).json('No such proposal found');
                }
                Location.findOne({ _id: mongoose.Types.ObjectId(data.locationId) }, { systemPrice: 1, rackRate: 1, bookingPriceUptilNow: 1 }).then((locationData) => {
                    const rackValueAsPerClient = data.clientFinalOfferAmmount / data.totalNumberOfSeats
                    const currentRackRate = locationData.bookingPriceUptilNow + data.clientFinalOfferAmmount
                    const pAndL = currentRackRate - rackValueAsPerClient

                    let newobj = data.toObject()
                    newobj.rackValueAsPerClient = rackValueAsPerClient
                    newobj.currentRackRate = currentRackRate
                    if (pAndL > 0) { newobj.loss = pAndL }
                    else { newobj.profit = pAndL }
                    newobj.locationData = locationData
                    res.status(200).send(newobj);
                }).catch((err) => {
                    if (!err.message) err.message = "something went wrong"
                    return next(err)
                })
            }).catch((err) => {
                if (!err.message) err.message = "something went wrong"
                return next(err)
            })







        //    const data = await Proposal.aggregate([
        //         { $match: { _id: id } },
        //         {
        //             $lookup: {
        //                 from: "locations",
        //                 localField: "locationId",
        //                 foreignField: "_id",
        //                 as: "location"
        //             }
        //         },
        //         {
        //             $project: {
        //                 _id: 0,
        //                 location:1,
        //                 center: 1,
        //                 floor: 1
        //               }
        //         }
        //     ])
        // console.log(data)
        // res.send(data)
    } catch (err) {
        if (!err.message) err.message = "something went wrong"
        if (!err.status) err.status = 400;
        throw err
    }
}

module.exports = recentProposalData