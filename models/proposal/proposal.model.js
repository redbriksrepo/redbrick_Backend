const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const proposalSchema = new Schema({
    salesTeam: String,
    salesHead: String,
    location: String,
    center: String,
    brokerType: String,
    brokerCategory: String,
    brokerCategoryOther: String,
    spocName: String,
    clientName: String,
    workstationSize: String,
    workstationNumber: Number,
    cabinSize: String,
    cabinNumber: Number,
    meetingRoomSize: String,
    meetingRoomNumber: Number,
    visitorMeetingRoomSize: String,
    visitorMeetingRoomNumber: Number,
    collabArea: String,
    dryPantry: String,
    storeRoom: String,
    storeRoomNumber: Number,
    cafeteria: String,
    cafeteriaNumber: Number,
    reception: String,
    mailRoom: String,
    bmsRoom: String,
    compactor: String,
    totalNoOfSeatsSelected: Number,
    OTP: Number,
    Tenure: Number,
    LockIn: Number, 
    NonStandardRequirement: String,
    Serviced: String,
    status: {
        type: String,
        default: "Pending"
    }
}, {
    timestamps: true
});

const Proposal = mongoose.model('Proposal', proposalSchema);

module.exports = Proposal;