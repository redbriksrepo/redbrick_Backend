const { default: mongoose } = require("mongoose");
const Location = require("../../../models/location/location.model");
const fs = require('fs');
const path = require('path');
const { json } = require("express");


const updateLocationData = (req, res, next) => {
    Id = req.params.Id;
    let data = req.body;
    let jsonUpdated = false;
    let layoutImageUpdated = false;
    try {
        if (!Id) {
            let error = new Error('Id not provided');
            error.status = 400;
            throw error;
        }
        else {
            Location.findById(mongoose.Types.ObjectId(Id)).then((locationData) => {
                if (req.files['jsonFile'] || req.files['layoutImage']) {
                    if (req.files['jsonFile']) {
                        fs.unlinkSync(locationData.jsonFile);
                        data.jsonFile = req.files['jsonFile'][0].path;
                        jsonUpdated = true;
                        // fs.unlink(locationData.jsonFile, (err) => {
                        //     if (err) throw err;
                        //     data.jsonFile = req.files['jsonFile'][0].path;
                        // })
                    }
                    if (req.files['layoutImage']) {
                        fs.unlinkSync(locationData.layoutImage);
                        data.layoutImage = req.files['layoutImage'][0].path;
                        layoutImageUpdated = true;
                        // fs.unlink(locationData.layoutImage, (err) => {
                        //     if (err) throw err;
                        //     data.layoutImage = req.files['layoutImage'][0].path;
                        // })
                    }
                }
                
                    if (data.location !== locationData.location || data.center !== locationData.center) {
                        if (!jsonUpdated) {
                            fs.renameSync(locationData.jsonFile, path.join('assets', 'layout', 'json', `${data.location}_${data.center}.json`));
                            data.jsonFile = path.join('assets', 'layout', 'json', `${data.location}_${data.center}.json`);                            
                        }
                        if (!layoutImageUpdated) {
                            fs.renameSync(locationData.layoutImage, path.join('assets', 'layout', 'image', `${data.location}_${data.center}.png`));
                            data.layoutImage = path.join('assets', 'layout', 'image', `${data.location}_${data.center}.png`);
                        }
                        
                        // fs.rename(locationData.layoutImage, path.join('assets', 'layout', 'image', `${data.location}_${data.center}.png`), (err) => {
                        //     if (err) throw err;
                        //     data.layoutImage = path.join('assets', 'layout', 'image', `${data.location}_${data.center}.png`);
                        // })
                    }
                
                if (data.imageLinks === '{}') {
                    delete data.imageLinks;
                }
                else {
                    data.imageLinks = Object.values(JSON.parse(data.imageLinks));
                }
                if (data.videoLinks === '{}') {
                    delete data.videoLinks;
                }
                else {
                    data.videoLinks = Object.values(JSON.parse(data.videoLinks));
                }
                if(data.rentSheet === '{}'){
                    delete data.rentSheet;
                }
                else{
                    data.rentSheet = Object.values(JSON.parse(data.rentSheet));
                }
            }).then(() => {
                console.log('Update Data::', data);
                Location.updateOne({ _id: mongoose.Types.ObjectId(Id) }, { $set: data }).then((result) => {
                    if (result.acknowledged) {
                        if (result.modifiedCount > 0) {
                            res.status(202).send({
                                "Message": "Location Data updated successfully"
                            })
                        }
                        else {
                            let error = new Error('Error while updating location data');
                            error.status = 503;
                            throw error;
                        }
                    }
                    else {
                        let error = new Error('Error while updating location data');
                        error.status = 503;
                        throw error;
                    }
                }).catch((err) => {
                    if (!err.message) err.message = 'Something went wrong while updation location data';
                    if (!err.status) err.status = 503;
                    next(err);
                })
            }).catch((err) => {
                if (!err.message) err.message = 'Error while detecting what was updated in location data';
                if (!err.status) err.status = 503;
                next(err);
            })
        }
    }
    catch (err) {
        if (!err.message) err.message = 'Error while updating location Data';
        if (!err.status) err.status = 503;
        throw err;
    }
}

module.exports = updateLocationData;