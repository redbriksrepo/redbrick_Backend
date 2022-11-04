const mongoose = require("mongoose");
// const ObjectId = require('mongoose')
const Proposal = require("../../../models/proposal/proposal.model")
const path = require('path');
const LogController = require("../../log/main.log.controller");

const initProposal = (req, res, next) => {
    let date = new Date();
    let data = req.body;
    console.log(data);
    // let layoutData = require(path.join('assets','layout','json',`${data.center}.json`))
    let Id = `RBO${String(data.location).toUpperCase().slice(0, 2)}${String(data.center).toUpperCase().slice(0, 2)}${("0" + date.getDate()).slice(-2)}${("0" + (date.getMonth() + 1)).slice(-2)}${("0" + date.getHours()).slice(-2)}${("0" + date.getMinutes()).slice(-2)}`
    // let Id = 'RBOHYSP02111251';
    let proposal = new Proposal();
    proposal._id = Id;
    proposal.save().then((result) => {
        if (result) {
            res.status(202).send({
                "Message": "Proposal Initiated Successfully",
                "Id": result._id
            })
        }
        else {
            let error = new Error('Something went wrong while initiating Proposal');
            error.status = 500;
            throw error;
        }
    }).catch((err) => {
        if (!err.status) err.status = 500;
        if (!err.message) err.message = 'Error while initiating Proposal';
        next(err);
    })
};

const addClientInfo = (req, res, next) => {
    let Id = req.params.Id;
    let data = req.body;
    try {
        if (!Id) {
            let error = new Error('Id not provided!');
            error.status = 406;
            throw error;
        }
        Proposal.findById(Id).then((proposal) => {
            if (!proposal) {
                let error = new Error('Proposal not found with given Id');
                error.status = 404;
                throw error;
            }
            else {
                try {
                    let clientInfoField = ['salesTeam', 'salesHead', 'location', 'center', 'broker', 'spocName', 'clientName'];
                    clientInfoField.forEach((key) => {
                        if (typeof (proposal?.[key]) === 'object') {
                            let subField = Object.keys(proposal?.[key]);
                            subField.forEach((subKey) => {
                                if (proposal?.[key]?.[subKey]) {
                                    let error = new Error('Client Info cannot be added twice');
                                    throw error;
                                }
                            })
                        }
                        else if (proposal?.[key]) {
                            let error = new Error('Client Info cannot be added twice');
                            throw error;
                        }
                    })
                }
                catch (err) {
                    if (!err.status) err.status = 406;
                    if (!err.message) err.message = 'Client Info cannot be added twice';
                    throw err;
                }
                Proposal.updateOne({ _id: Id }, { $set: data }).then((result) => {
                    if (result.acknowledged === true) {
                        if (result.modifiedCount > 0) {
                            LogController.proposal.create(Id, data.clientName);                                              // generation proposal Log
                            res.status(202).send({
                                "Message": "Client Info added Successfully!"
                            });
                        } else {
                            let error = new Error('Proposal not found with given Id');
                            error.status = 404;
                            throw error;
                        }
                    } else {
                        let error = new Error('Error when adding client Info');
                        throw error;
                    }
                }).catch((err) => {
                    if (!err.message) err.message = 'Error when adding client Info';
                    if (!err.status) err.status = 400;
                    next(err);
                })
            }
        }).catch((err) => {
            if (!err.message) err.message = 'Error when adding client Info';
            if (!err.status) err.status = 400;
            next(err);
        })
    }
    catch (err) {
        if (!err.status) err.status = 400;
        if (!err.message) err.message = 'Error while adding client Info';
        throw err;
    }
}

const checkRequiredNoOfSeats = (req, res, next) => {
    let data = req.body;
    let Id = req.params.Id;
    let totalNoOfSeats = data.workstationNumber + data.cabinNumber + data.meetingRoomNumber + data.visitorMeetingRoomNumber;
    Proposal.updateOne({ _id: Id }, { $set: { totalNoOfSeatsSelected: totalNoOfSeats } }).then((result) => {
        if (result.acknowledged === true) {
            if (result.modifiedCount > 0) {
                next();
            }
            else {
                let error = new Error('Something went wrong while calculating total no of Seats');
                throw error;
            }
        }
        else {
            let error = new Error('Cannot find proposal with given Id');
            throw error;
        }
    }).catch((err) => {
        if (!err.message) err.message = 'Error while calculating total no of Seats';
        if (!err.status) err.status = 400;
        next(err);
    })
}

const addProposalRequirement = (req, res, next) => {
    let data = req.body;
    let Id = req.params.Id;
    let response;
    try {
        if (!Id) {
            let error = new Error('Id not provided');
            error.status = 406;
            throw error;
        }
        Proposal.findById(Id).then((proposal) => {
            if (!proposal) {
                let error = new Error('Proposal not found with given Id');
                error.status = 404;
                throw error;
            }
            else {
                // try {
                //     let requirementFields = ['workStation', 'cabin', 'meetingRooms'];
                //     requirementFields.forEach((mainField) => {
                //         if (proposal?.[mainField]) {
                //             let error = new Error('Requirement cannot be added twice');
                //             throw error;
                //         }
                //     })
                // }
                // catch (err) {
                //     if (!err.status) err.status = 406;
                //     if (!err.message) err.message = 'Requirement cannot be added twice';
                //     // console.log(err);
                //     throw err;
                // }
                try {
                    let requirementField = ['workstationSize', 'workstationNumber', 'cabinSize', 'cabinNumber', 'meetingRoomSize', 'meetingRoomNumber', 'visitorMeetingRoomSize', 'visitorMeetingRoomNumber', 'collabArea', 'dryPantry', 'storeRoom', 'storeRoomNumber', 'cafeteria', 'cafeteriaNumber', 'reception', 'mailRoom', 'bmsRoom', 'compactor'];
                    requirementField.forEach((field) => {
                        if (proposal?.[field]) {
                            let error = new Error('Requirement cannot be added twice');
                            throw error;
                        }
                    })
                }
                catch (err) {
                    if (!err.status) err.status = 406;
                    if (!err.message) err.message = 'Requirement cannot be added twice';
                    // console.log(err);
                    throw err;
                }

                Proposal.updateOne({ _id: Id }, { $set: data }).then((result) => {
                    if (result.acknowledged === true) {
                        if (result.modifiedCount > 0) {
                            LogController.proposal.update(Id, 'Added Requirement Info');
                            Proposal.find()
                                .where('location').equals(proposal.location).where('center').equals(proposal.center)
                                .where('totalNoOfSeatsSelected').gte(proposal.totalNoOfSeatsSelected - ((proposal.totalNoOfSeatsSelected * 5) / 100)).lte(proposal.totalNoOfSeatsSelected + ((proposal.totalNoOfSeatsSelected * 5) / 100))
                                .then((result) => {
                                    if (result.length > 1) {
                                        res.status(202).send({
                                            "Message": "Requirement added Successfully!",
                                            "conflict": true
                                        })
                                        console.log('conflict::true');
                                    }
                                    else {
                                        res.status(202).send({
                                            "Message": "Requirement added Successfully!",
                                            "conflict": false
                                        })
                                        console.log('conflict::flase');
                                    }
                                })
                            // Proposal.find()
                            //     .where('workStation.workStationNumber').gte(data.workStation.workStationNumber - ((data.workStation.workStationNumber * 5) / 100)).lte(data.workStation.workStationNumber + ((data.workStation.workStationNumber * 5) / 100))
                            //     .where('workStation.storageRoomNumber').gte(data.workStation.storageRoomNumber - ((data.workStation.storageRoomNumber * 5) / 100)).lte(data.workStation.storageRoomNumber - ((data.workStation.storageRoomNumber * 5) / 100))
                            //     .where('workStation.cafeteriaNumber').gte(data.workStation.cafeteriaNumber - ((data.workStation.cafeteriaNumber * 5) / 100)).lte(data.workStation.cafeteriaNumber - ((data.workStation.cafeteriaNumber * 5) / 100))
                            //     .where('cabin.cabinNumber').gte(data.cabin.cabinNumber - ((data.cabin.cabinNumber * 5) / 100)).lte(data.cabin.cabinNumber - ((data.cabin.cabinNumber * 5) / 100))
                            //     .where('cabin.visitorMeetingRoom.visitorMeetingRoomNumber').gte(data.cabin.visitorMeetingRoom.visitorMeetingRoomNumber - ((data.cabin.visitorMeetingRoom.visitorMeetingRoomNumber * 5) / 100)).lte(data.cabin.visitorMeetingRoom.visitorMeetingRoomNumber - ((data.cabin.visitorMeetingRoom.visitorMeetingRoomNumber * 5) / 100))
                            //     .where('meetingRooms.meetingRoomsNumber').gte(data.meetingRooms.meetingRoomsNumber - ((data.meetingRooms.meetingRoomsNumber * 5) / 100)).lte(data.meetingRooms.meetingRoomsNumber - ((data.meetingRooms.meetingRoomsNumber * 5) / 100))
                            //     .where('center').equals(data.center)
                            //     .where('location').equals(data.location)
                            //     .then((result) => {
                            //         console.log(result);
                            //     }).catch((err) => {
                            //         console.log(err);
                            //     });
                            // res.status(202).send({
                            //     "Message": "Requirement added Successfully!"
                            // });
                        }
                        else {
                            let error = new Error('Proposal not found with given Id');
                            error.status = 404;
                            throw error;
                        }
                    }
                    else {
                        let error = new Error('Error When adding Requirement to proposal');
                        error.status = 400;
                        throw error;
                    }
                }).catch((err) => {
                    if (!err.message) err.message = 'Error when adding requirement to proposal';
                    if (!err.status) err.status = 400;
                    console.log(err);

                    next(err);
                })

            }
        }).catch((err) => {
            if (!err.message) err.message = 'Error when adding requirement to proposal';
            if (!err.status) err.status = 400;
            console.log(err);

            next(err);
        })
    }
    catch (err) {
        if (!err.status) err.status = 400;
        if (!err.message) err.message = 'Error while adding Requirement To Proposal';
        console.log(err);

        throw err;
    }
}

const create = {
    init: initProposal,
    addClientInfo: addClientInfo,
    checkRequiredNoOfSeats: checkRequiredNoOfSeats,
    addProposalRequirement: addProposalRequirement
};

module.exports = create;