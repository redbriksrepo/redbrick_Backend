const Proposal = require("../../../models/proposal/proposal.model");

const approveClouser = (req, res, next) => {
    try {
        let Id = req.params.Id;
        let currentUser = req.user;
        let data = req.body;
        if (!Id) throw new Error('Id not Provided').status = 400;
        if (currentUser.role === 'sales head') {
            Proposal.findById(Id).then((proposal) => {
                Proposal.updateOne({ _id: proposal._id }, { $set: { finalOfferAmmount: data.finalOfferAmmount || proposal.clientFinalOfferAmmount || proposal.previousFinalOfferAmmount, status: 'Completed and approved' } }).then((updateResult) => {
                    if (updateResult.acknowledged && updateResult.modifiedCount > 0) {
                        res.status(202).send({
                            "Message": "Proposal Approved!"
                        })
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