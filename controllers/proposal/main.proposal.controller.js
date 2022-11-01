const create = require('./create/create.proposal.controller');
const getAll = require('./getAll/getAll.proposal.controller');
const generateLayout = require('./layout/layout.proposal.controller');
const sendOtp = require('./send-otp/send-otp.controller');
const verifyOtp = require('./verify-otp/verify-otp.controller');
const generate = require('./generate-proposal/generate-proposal.controller');

const proposalController = {
    create: create,
    getAll: getAll,
    layout: generateLayout,
    sendOtp: sendOtp,
    verifyOtp: verifyOtp,
    generate: generate
};

module.exports = proposalController;