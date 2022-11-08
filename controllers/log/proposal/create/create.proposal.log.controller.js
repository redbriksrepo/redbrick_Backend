const ProposalLog = require("../../../../models/proposal-log/proposal-log.model")

const createProposalLog = (proposalId,ClientName) => {
    let proposalLogData = {
        proposalId: proposalId,
        logMessage: 'Initialized with client Info',
        clientName: ClientName,
        createdAt: new Date()
    }
    let proposalLog = new ProposalLog(proposalLogData);
    proposalLog.save().then((result) => {
        console.log('Log Generated::', result);
    }).catch((err) => {
        console.log(err);
    })
}

module.exports = createProposalLog;