const proposalController = require('../../controllers/proposal/main.proposal.controller');
const middleware = require('../../middlewares/main.middlewares');

const proposalRoute = require('express').Router();

proposalRoute.get('/init/:Id',middleware.authentication, proposalController.create.init);

proposalRoute.post('/addClientInfo/:Id',middleware.authentication, proposalController.create.addClientInfo);

proposalRoute.post('/addRequirement/:Id',middleware.authentication,proposalController.create.checkRequiredNoOfSeats, proposalController.create.addProposalRequirement);

proposalRoute.post('/update');

proposalRoute.post('/delete');

proposalRoute.get('/getAll',middleware.authentication, proposalController.getAll);

proposalRoute.get('/getById');

proposalRoute.get('/layout/:Id/:selectFrom', proposalController.layout);

proposalRoute.post('/generate/:Id/?:selectFrom',middleware.authentication, proposalController.generate.generateProposal, proposalController.generate.generateProposalPDF, proposalController.generate.sendProposalByEmail);

// proposalRoute.post('/send-otp/:Id',middleware.authentication, proposalController.sendOtp);

// proposalRoute.post('/verify-otp/:Id', middleware.authentication, proposalController.verifyOtp);

proposalRoute.get('/checkSeatAvailabilityAndConsolidatedSeats/:Id', proposalController.checkSeatAvailabilityAndConsolidatedSeats);

proposalRoute.get('/resolveConflict/:Id', proposalController.resolveConflict);

proposalRoute.get('/finalOfferAmmount/:Id', proposalController.finalOfferAmmount);

proposalRoute.post('/esclateToClosure/:Id', proposalController.updateFinalOfferAmmount);

proposalRoute.post('/approveProposal/:Id', proposalController.approveProposal, proposalController.generate.generateProposalPDF);

module.exports = proposalRoute;