const Proposal = require("../../../models/proposal/proposal.model");

const getLayoutDataByLocationId = (req, res, next) => {
    const locationId = req.params.Id;

    try {
        Proposal.find({ locationId, status: "Completed and Locked" }).then((lockedProposals) => {
            if (lockedProposals.length > 0) {
                res.status(200).send(lockedProposals);
            } else {
               res.status(200).send({
                message:'no data'
               })
            }
        }).catch((err) => {
            if (!err.status) err.status = 400;
            next(err);
        });
    } catch (err) {
        if (!err.status) err.status = 400;
        next(err);
    }
};

module.exports = getLayoutDataByLocationId;
