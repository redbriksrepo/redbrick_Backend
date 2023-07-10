const Proposal = require("../../../models/proposal/proposal.model");
const Location = require("../../../models/location/location.model")
const lockProposal = (req, res, next) => {
    try {
        let Id = req.params.Id;
        let currentUser = req.user;
        // console.log(currentUser);
        let data = req.body;

        if (!Id) throw new Error('Id not Provided').status = 400;
        if (currentUser.role === 'admin') {

            Proposal.findById(Id).then((proposal) => {
   
                Proposal.updateOne({ _id: proposal._id }, { $set: { status: 'Completed and Locked', lockedProposal: true } }).then((updateResult) => {
        
                    if (updateResult.acknowledged && updateResult.modifiedCount > 0) {
                        Location.findOne({ location: proposal.location, center: proposal.center }).then((locationdata) => {
            
                            let rackRate = locationdata.rackRate
                            let setValueofFutureRackRate;
                            let setCurrentRackRate;
                            let bookingPriceUptilNow = Number(locationdata.bookingPriceUptilNow) + Number(proposal.salesHeadFinalOfferAmmount);
                            let selectedNoOfSeats = locationdata.selectedNoOfSeats + proposal.totalNumberOfSeats;
                            setCurrentRackRate = Math.round(bookingPriceUptilNow / selectedNoOfSeats)
                            let profitLoss = setCurrentRackRate - rackRate
                 
                          
                                if (profitLoss < 0) {
                               
                                    let lossInRackRate = locationdata.rackRate - profitLoss;
                                    setValueofFutureRackRate = Math.ceil(lossInRackRate / 500) * 500;
                                } else {
                                    setValueofFutureRackRate = locationdata.rackRate
                                }
                            
             

                            let updateData = {
                                selectedNoOfSeats:selectedNoOfSeats,
                                totalProposals: locationdata.totalProposals + 1,
                                bookingPriceUptilNow:bookingPriceUptilNow,
                                futureRackRate: setValueofFutureRackRate,
                                currentRackRate: setCurrentRackRate
                            }

                            // console.log('AFTER LOCKED LOCATION VALUE => ',updateData);

                            Location.updateOne({ location: proposal.location, center: proposal.center }, { $set: updateData }).then((result) => {

                                if (result.acknowledged === true && result.modifiedCount > 0) {
                                    result.message = 'Succesfully updated';
                                }
                                else throw Error('Problem while updating');
                            });
                        });
                        req.locationData = {
                            address: proposal.address
                        }
                        res.status(202).send({
                            "Message": "Locked Successfully!"
                        })
                        // console.log("Approve if", proposal.address);/


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

module.exports = lockProposal;