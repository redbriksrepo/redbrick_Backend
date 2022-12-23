const getLocationData = require("./locationData/locationData.dashboard.controller");
const getRecentProposalData = require("./recentProposal/recentProposal.dashboard.controller");
const getUserData = require("./userData/userData.dashboard.controller");
const proposalWithConflict = require('./proposalWithConflict/proposalWithConflict.dashboard.controller');

const dashboardController = {
    userData: getUserData,
    recentProposal: getRecentProposalData,
    getLocationData: getLocationData,
    proposalWithConflict: proposalWithConflict
}

module.exports = dashboardController;