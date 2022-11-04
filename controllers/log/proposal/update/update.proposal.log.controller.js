const ProposalLog = require("../../../../models/proposal-log/proposal-log.model");

const updateProposalLog = (proposalId, logMessage) => {
    let proposalLogData = {
        logMessage: logMessage,
        updatedAt: new Date()
    };

    ProposalLog.updateOne({ proposalId: proposalId }, proposalLogData).then((result) => {
        console.log(result);
        if (result.acknowledged === true) {
            if (result.modifiedCount > 0) {
                console.log(proposalLogData);
            }
        } else {
            console.log('Id not mached');
        }
    }).catch((err) => {
        console.log(err);
    })
}

module.exports = updateProposalLog;