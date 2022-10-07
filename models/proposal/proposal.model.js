const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const proposalSchema = new Schema({
    salesTeam: String,
    salesHead: String,
    location: String,
    center: String,
    broker: {
        brokerType: String,
        brokerCategory: String,
        brokerCategoryOther: String
    },
    spocName: String,
    clientName: String,
    workStation: new Schema({
        workStationCategory: String,
        workStationNumber: Number,
        collabArea: String,
        dryPantry: String,
        storageRoom: String,
        storageRoomNumber: Number,
        cafeteria: String,
        cafeteriaNumber: Number
    }),
    cabin: new Schema({
        cabinCategory: String,
        cabinNumber: Number,
        reception: String,
        visitorMeetingRoom: new Schema({
            visitorMeetingRoomToggle: String,
            visitorMeetingRoomCategory: String,
            visitorMeetingRoomNumber: Number
        })
    }),
    meetingRooms: new Schema({
        meetingRoomsCategory: String,
        meetingRoomsNumbers: Number,
        mailRoom: String,
        bmsRoom: String,
        compactor: String
    }),
    status: {
        type: String,
        default: "Pending"
    }
}, {
    timestamps: true
});

const Proposal = mongoose.model('Proposal', proposalSchema);

module.exports = Proposal;