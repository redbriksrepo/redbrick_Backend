const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationModel = new Schema({
    city: String,
    state: String,
    area: String,
    locality: String,
    dimensions: String,
    address: String,
    pinCode: String,
    images: Array
},{
    timestamps: true
});

const Location = mongoose.model('Location',locationModel);

module.exports = Location;