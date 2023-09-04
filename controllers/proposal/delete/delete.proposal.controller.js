const Proposal = require('../../../models/proposal/proposal.model')
const ProposalLog = require('../../../models/proposal-log/proposal-log.model')
const deleteProposal = (req, res, next) => {
    let proposalId = req.params.Id;
    // console.log(proposalId)
    try {
        if (!proposalId) {
            let err = new Error("Enter Proposal Id")
            err.status = 401;
            throw (err)
        } else {
            Proposal.findByIdAndDelete(proposalId).then((result) => {
                // console.log(result);
                if (!result) {
                    let err = new Error('Error while deleting')
                    err.status = 503;
                    next(err)
                } else {
                    ProposalLog.updateOne({ proposalId: proposalId }, { $set: { logMessage: "Deleted" } }).then((resp) => {
                        if (!resp || resp == null) {
                            let err = new Error('Error while update Log')
                            err.status = 503;
                            next(err)
                        } else {
                            // console.log(resp)
                            res.status(200).send('Deleted Successfully')
                        }
                    }).catch(err => {
                        message: "error while updating log ",
                            next(err)
                    })
                }
            })
        }
    } catch (err) {
        if (!err.message) err.message = 'error while deleting proposal'
        throw (err)
    }
}

module.exports = deleteProposal;