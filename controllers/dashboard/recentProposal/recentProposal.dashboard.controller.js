const Proposal = require("../../../models/proposal/proposal.model");

const getRecentProposalData = (req, res, next) => {
    try {
        let currentUser = req.user;
        let date = new Date().toDateString();
        date = new Date(date);

        const recentProposal = () => {
            if (currentUser.role === 'admin') {
                // return Proposal.find().select('salesPerson status').where('createdAt').gt(date).populate('salesPerson', 'firstName lastName');
                return Proposal.find().select('salesPerson status').where('escalateForCloser').equals(true).nor([{status: "Accepted"}]).populate('salesPerson', 'firstName lastName');
            }
            else if (currentUser.role === 'sales head') {
                // return Proposal.find().select('salesPerson status').where('createdAt').gt(date).populate('salesPerson', 'firstName lastName').where('salesHead').equals(currentUser._id);
                return Proposal.find().select('salesPerson status').where('escalateForCloser').equals(true).nor([{ status: "Accepted" }]).populate('salesPerson', 'firstName lastName').where('salesHead').equals(currentUser._id);
            }
            else {
                let error = new Error('not Authorized');
                error.status = 401;
                throw error;
            }
        }
            recentProposal().then((proposal) => {
                res.json(proposal);
            })

        // else if( )
    }
    catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        throw err;
    }
}

module.exports = getRecentProposalData;