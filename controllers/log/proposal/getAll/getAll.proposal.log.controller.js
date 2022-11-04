const ProposalLog = require("../../../../models/proposal-log/proposal-log.model")

const getAllProposalLog = (req, res, next) => {
    ProposalLog.find().then((proposalLogs) => {
        if (!proposalLogs) {
            let error = new Error('Error while geting all the proposal logs.');
            error.status = 400;
            throw error;
        }
        res.status(200).send(proposalLogs);
    }).catch((err) => {
        if (!err.message) err.message = 'Error while geting all the proposal logs.';
        if (!err.status) err.status = 400;
        next(err);
    })
}

module.exports = getAllProposalLog;