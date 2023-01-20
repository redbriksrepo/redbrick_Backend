const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const proposalSchema = new Schema({
    _id: String,
    salesTeam: String,
    salesHead: {
        type: Schema.Types.ObjectId,
        required: true
    },
    location: String,
    center: String,
    brokerType: String,
    brokerCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Broker'
    },
    clientName: String,
    clientEmail:String,
    salesPerson: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
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
    consolidatedSeats: {
        type: Boolean,
        default: false
    },
    seatAvailability: {
        type: Boolean,
        default: true
    },
    finalOfferAmmount: Number,
    escalateForCloser: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default: "In-Progress"
    },
    finalOfferAmmount: Number,
    previousFinalOfferAmmount: Number,
    clientFinalOfferAmmount: Number,
    selectFrom: {
        type: String,
        default: 'left'
    }
}, {
    timestamps: true
});

const Proposal = mongoose.model('Proposal', proposalSchema);

module.exports = Proposal;