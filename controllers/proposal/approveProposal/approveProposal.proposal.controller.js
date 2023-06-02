const Proposal = require("../../../models/proposal/proposal.model");
const Location = require("../../../models/location/location.model")
const approveClouser = (req, res, next) => {
    try {
        let Id = req.params.Id;
        let currentUser = req.user;
        console.log(currentUser);
        let data = req.body;
       
        if (!Id) throw new Error('Id not Provided').status = 400;
        if (currentUser.role === 'sales head') {
            Proposal.findById(Id).then((proposal) => {
                Proposal.updateOne({ _id: proposal._id }, { $set: {salesHeadFinalOfferAmmount:data.salesHeadFinalOfferAmmount, finalOfferAmmount: data.finalOfferAmmount || proposal.clientFinalOfferAmmount || proposal.previousFinalOfferAmmount, status: 'Completed and approved', lockedProposal:false } }).then((updateResult) => {
                

                    if (updateResult.acknowledged && updateResult.modifiedCount > 0) {
                        // Location.findOne({ location: proposal.location, center: proposal.center }).then((locationdata) => {
                        //     Location.updateOne({ location: proposal.location, center: proposal.center }, { $set: { bookingPriceUptilNow: Number(locationdata.bookingPriceUptilNow) + Number(data.salesHeadFinalOfferAmmount) }}).then((result)=>{
                        //         if (result.acknowledged === true) {
                        //             result.message='Succesfully Approved';
                        //         }
                        //         else throw Error('Problem while updating');
                        //     });
                        // });
                        // res.status(202).send({
                        //     "Message": "Proposal Approved!"
                        // })
                        // console.log("Approve if",proposal.address);
                     
                        req.locationData = {
                            address: proposal.address
                        }
                        next();
                    }
                    else throw new Error('Something went wrong').status = 400;
                }).catch((err) => {
                    if (!err.message) err.message = 'Something went wrong';
                    if (!err.status) err.status = 400;
                    return next(err);
                })
            }).catch((err) => {
                if (!err.message) err.message = 'Something went wrong';
                if (!err.status) err.status = 400;
                return next(err);
            })
        }
        else throw new Error('Unauthorized user').status = 401;
    }
    catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        if (!err.status) err.status = 400;
        throw err;
    }
}

module.exports = approveClouser;