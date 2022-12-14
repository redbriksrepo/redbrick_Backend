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
    availableNoOfWorkstation:{
        type: Number,
        required: true
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
    salesHead: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
},{
    timestamps: true
});

const Location = mongoose.model('Location',locationModel);

module.exports = Location;