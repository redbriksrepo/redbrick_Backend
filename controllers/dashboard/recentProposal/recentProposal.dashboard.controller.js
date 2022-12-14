const Proposal = require("../../../models/proposal/proposal.model");

const getRecentProposalData = (req, res, next) => {
    try {
        let currentUser = req.user;
        let date = new Date().toDateString();
        date = new Date(date);
        console.log(date);
        if (currentUser.role === 'admin') {
            Proposal.find().select('salesPerson status').where('createdAt').gt(date).populate('salesPerson', 'firstName lastName').then((proposal) => {
                res.json(proposal);
            })
        }
        // else if( )
    }
    catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        throw err;
    }
}

module.exports = getRecentProposalData;