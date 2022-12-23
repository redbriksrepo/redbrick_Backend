const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const proposalLogSchema = new Schema({
    proposalId: {
        type: String,
        required: true
    },
    logMessage: {
        type: String,
        required: true
    },
    salesPerson: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    salesHead: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    clientName: {
        type: String,
        required: true
    },
    proposalGenerated: {
        type: String,
        default: 'no'
    },
    seatsSelected: Number,
    location: {
        type: String,
        required: true
    },
    center: {
        type: String,
        required: true
    }

}, {
    timestamps: true
});

const ProposalLog = mongoose.model('ProposalLog', proposalLogSchema);

module.exports = ProposalLog;