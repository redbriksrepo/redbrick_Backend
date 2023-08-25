const create = require('./create/create.proposal.controller');
const getAll = require('./getAll/getAll.proposal.controller');
// const generateLayout = require('./layout/layout.proposal.controller');
const sendLayout = require('./layout/sendDataOfLayout.controller')
const sendOtp = require('./send-otp/send-otp.controller');
const verifyOtp = require('./verify-otp/verify-otp.controller');
const generate = require('./generate-proposal/new-generate-proposal.controller');
const checkSeatAvailabilityAndConsolidatedSeats = require('./checkSeatAvailabilityAndConsolidatedSeats/checkSeatAvailabilityAndConsolidatedSeats.proposal.controller');
const resolveConflict = require('./resolveConflict/resolveConflict.proposal.controller');
const getFinalOfferAmmount = require('./getFinalOfferAmmount/getFinalOfferAmmount.proposal.controller');
const updateFinalOfferAmmount = require('./esclateToClosure/esclateToClosure.proposal.controller');
const approveProposal = require('./approveProposal/approveProposal.proposal.controller');
const getProposalById = require('./getProposalById/getProposalById.controller')
const lockProposal = require('./lockProposal/lockProposal.proposal.controller')
const updateProposalId = require('./updateProposalId/update-proposalID.controller');
const addLockSeat = require('./addLockSeats/add-locked.controller');
const viewLayoutSales = require('./viewLayoutForSales/veiw-layout-sales-dashboard.controller');
const sendImageData = require('./layout/saveImageData.proposal.controller');
const proposalController = {
    create: create,
    getAll: getAll,
    getProposalById:getProposalById,
    layout: sendLayout,
    sendOtp: sendOtp,
    verifyOtp: verifyOtp,
    generate: generate,
    checkSeatAvailabilityAndConsolidatedSeats,
    resolveConflict,
    finalOfferAmmount: getFinalOfferAmmount,
    updateFinalOfferAmmount,
    approveProposal,
    lockProposal,
    updateProposalId,
    addLockSeat:addLockSeat,
    viewLayoutSales:viewLayoutSales,
    sendImage:sendImageData
};

module.exports = proposalController;