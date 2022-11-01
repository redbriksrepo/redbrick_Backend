const proposalController = require('../../controllers/proposal/main.proposal.controller');

const proposalRoute = require('express').Router();

proposalRoute.get('/init', proposalController.create.init);

proposalRoute.post('/addClientInfo/:Id', proposalController.create.addClientInfo);

proposalRoute.post('/addRequirement/:Id',proposalController.create.checkRequiredNoOfSeats, proposalController.create.addProposalRequirement);

proposalRoute.post('/update');

proposalRoute.post('/delete');

proposalRoute.get('/getAll', proposalController.getAll);

proposalRoute.get('/getById');

proposalRoute.get('/layout/:Id/:selectFrom', proposalController.layout);

proposalRoute.post('/generate/:Id/:selectFrom',proposalController.generate.generateProposal, proposalController.generate.generateProposalPDF);

proposalRoute.post('/send-otp/:Id', proposalController.sendOtp);

proposalRoute.post('/verify-otp/:Id', proposalController.verifyOtp);

module.exports = proposalRoute;