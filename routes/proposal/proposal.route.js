const proposalController = require('../../controllers/proposal/main.proposal.controller');

const proposalRoute = require('express').Router();

proposalRoute.get('/init', proposalController.create.init);

proposalRoute.post('/addClientInfo/:Id', proposalController.create.addClientInfo);

proposalRoute.post('/addRequirement/:Id', proposalController.create.addProposalRequirement);

proposalRoute.post('/update');

proposalRoute.post('/delete');

proposalRoute.get('/getAll');

proposalRoute.get('/getById');

module.exports = proposalRoute;