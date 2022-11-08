const ProposalLog = require("../../../../models/proposal-log/proposal-log.model");

const updateProposalLog = (proposalId, logData) => {
    logData = {...logData, updatedAt: new Date()}

    ProposalLog.updateOne({ proposalId: proposalId }, logData).then((result) => {
        // console.log(result);
        // if (result.acknowledged === true) {
        //     if (result.modifiedCount > 0) {
        //         console.log(proposalLogData);
        //     }
        // }
    })
}

module.exports = updateProposalLog;