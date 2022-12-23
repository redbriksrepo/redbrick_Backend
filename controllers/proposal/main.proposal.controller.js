const create = require('./create/create.proposal.controller');
const getAll = require('./getAll/getAll.proposal.controller');
const generateLayout = require('./layout/layout.proposal.controller');
const sendOtp = require('./send-otp/send-otp.controller');
const verifyOtp = require('./verify-otp/verify-otp.controller');
const generate = require('./generate-proposal/generate-proposal.controller');
const checkSeatAvailabilityAndConsolidatedSeats = require('./checkSeatAvailabilityAndConsolidatedSeats/checkSeatAvailabilityAndConsolidatedSeats.proposal.controller');
const resolveConflict = require('./resolveConflict/resolveConflict.proposal.controller');
const getFinalOfferAmmount = require('./getFinalOfferAmmount/getFinalOfferAmmount.proposal.controller');
const updateFinalOfferAmmount = require('./esclateToClosure/esclateToClosure.proposal.controller');
const approveProposal = require('./approveProposal/approveProposal.proposal.controller');

const proposalController = {
    create: create,
    getAll: getAll,
    layout: generateLayout,
    sendOtp: sendOtp,
    verifyOtp: verifyOtp,
    generate: generate,
    checkSeatAvailabilityAndConsolidatedSeats,
    resolveConflict,
    finalOfferAmmount: getFinalOfferAmmount,
    updateFinalOfferAmmount,
    approveProposal
};

module.exports = proposalController;