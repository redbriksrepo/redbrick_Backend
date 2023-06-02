const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationModel = new Schema({
    location: {
        type: String,
        required: true
    },
    center: {
        type: String,
        required: true
    },
    perSeatPrice:{
        type:Number,
    },
    selectedNoOfSeats:{
        type: Number,
        default: 0
    },
    lockedSeats:{
        type: Number,
    },
    systemPrice:{
        type:Number
        // default: 1490
    },
    systemPriceNS:{
        type:Number
        // default: 14900
    },
    availableNoOfWorkstation: {
        type: Number,
        default: 0
    },
    totalNoOfWorkstation: {
        type: Number,
        required: true
    },
    jsonFile: {
        type: String,
        required: true
    },
    layoutImage: {
        type: String,
        required: true
    },
    imageLinks: {
        type: Array,
    },
    videoLinks: {
        type: Array
    },
    rentSheet:{
        type:Array
    },
    rentAndCamTotal:{
        type:Number
    },
    carParkCharge:{
        type: Number
    },
    futureRackRate:{
        type:Number,
        default:0
    },
    currentRackRate:{
        type:Number,
        default:0
    },
    rackRate:{
        type:Number
    },
    rackRateNS:{
        type:Number
    },
    bookingPriceUptilNow:{
        type:Number,
        default:0
    },
    seatPriceAsPerSales:{
        type:Number,
    },
    totalProposals:{
        type: Number,
        default:0
    },
    // rent:{
    //     type: Number
    // },
    // cam:{
    //     type: Number
    // },
    // yearnew:{
    //     type: Number
    // },
    salesHead: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    address: String
},{
    timestamps: true
});

const Location = mongoose.model('Location',locationModel);

module.exports = Location;