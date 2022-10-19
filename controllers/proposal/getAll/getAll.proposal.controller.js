const Proposal = require("../../../models/proposal/proposal.model");


const getAllProposal = (req, res, next) => {
    try {
        Proposal.find().then((allProposal) => {
            if (allProposal) {
                res.status(200).send(allProposal);
            }
            else {
                let error = new Error('Something went wrong ')
            }
        }).catch((err) => {
            if (!err.status) err.status = 400;
            next(err);
        })
    }
    catch (err) {
        if (!err.status) err.status = 400;
        throw err;
    }
}

module.exports = getAllProposal;