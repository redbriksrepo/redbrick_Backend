const create = require('./create/create.proposal.controller');
const getAll = require('./getAll/getAll.proposal.controller');
const generateLayout = require('./layout/layout.proposal.controller');

const proposalController = {
    create: create,
    getAll: getAll,
    layout: generateLayout
};

module.exports = proposalController;