const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const selectionDataSchema = require('../selectionData/selectionData.modal');

const proposalSchema = new Schema({
    _id: String,
    salesTeam: String,
    salesHead: {
        type: Schema.Types.ObjectId,
        required: true
    },
    location: String,
    center: String,
    address:String,
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
    areaOfSelectedSeat:Number,
    workstation2x1: Number,
    workstation3x2: Number,
    workstation4x2: Number,
    workstation5x2: Number,
    workstation5x2_5: Number,
    workstation4x4: Number,
    workstation5x4: Number,
    workstation5x5: Number,
    cubicalCount:Number,
    cabinRegular: Number,
    cabinMedium: Number,
    cabinLarge: Number,
    cabinMD:Number,
    meeting4P: Number,
    meeting6P: Number,
    meeting8P: Number,
    meeting10P: Number,
    meeting12P: Number,
    meeting16P: Number,
    board20P: Number,
    board24P:Number,
    collab4P: Number,
    collab6P: Number,
    collab8P:Number,
    dryPantryNumber: Number,
    receptionSmall: Number,
    receptionMedium: Number,
    receptionLarge: Number,
    storeRoomNumber: Number,
    phoneBoothNumber: Number,
    nicheSeat2Pax: Number,
    nicheSeat4Pax: Number,
    cafeteriaNumber: Number,
    server1Rack: Number,
    server2Rack: Number,
    server3Rack: Number,
    server4Rack: Number,
    prayerRoomNumber: Number,
    wellnessRoomNumber: Number,
    trainingRoomNumber: Number,
    gameRoomNumber: Number,
    content:String,
    totalNumberOfSeats:Number,
    OTP: Number,
    Tenure: Number,
    LockIn: Number, 
    NonStandardRequirement: String,
    Serviced: String,
    serviceCosts: Number,
    consolidatedSeats: {
        type: Boolean,
        default: false
    },
    seatAvailability: {
        type: Boolean,
        default: true
    },
    escalateForCloser: {
        type: Boolean,
        default: false
    },
    lockedProposal:{
        type:Boolean,
        default: false
    },
    status: {
        type: String,
        default: "In-Progress"
    },
    systemValue:Number,
    salesHeadFinalOfferAmmount:{
        type:Number,
        default:0
    },
    finalOfferAmmount: Number,
    rackValue:Number,
    previousFinalOfferAmmount: Number,
    clientFinalOfferAmmount: Number,
    selectFrom: {
        type: String,
        default: 'left'
    },
    selectionData: [
        {
            type: Schema.Types.ObjectId,
            ref: 'selectionData'
        }
    ]
}, {
    timestamps: true
});

const Proposal = mongoose.model('Proposal', proposalSchema);

module.exports = Proposal;