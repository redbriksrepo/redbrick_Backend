const dashboardController = require('../../controllers/dashboard/main.dashboard.controller');

const dashboardRoute = require('express').Router();

dashboardRoute.get('/userData', dashboardController.userData);

dashboardRoute.get('/recentProposal', dashboardController.recentProposal);

dashboardRoute.get('/locationData', dashboardController.getLocationData);

dashboardRoute.get('/proposalWithConflict', dashboardController.proposalWithConflict);

dashboardRoute.get('/centers/:locationName',dashboardController.getcenterData);

dashboardRoute.get('/floorData/:locationName/:centerName',dashboardController.getFloorData);
dashboardRoute.get('/recentProposalData/:Id', dashboardController.recentProposalData)

module.exports = dashboardRoute;