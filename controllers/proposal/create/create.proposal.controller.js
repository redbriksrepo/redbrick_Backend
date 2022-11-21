const mongoose = require("mongoose");
// const ObjectId = require('mongoose')
const Proposal = require("../../../models/proposal/proposal.model")
const path = require('path');
const LogController = require("../../log/main.log.controller");
const Location = require("../../../models/location/location.model");

const initProposal = (req, res, next) => {
    try {
        let date = new Date();
        let centerId = req.params.Id;
        if (!centerId) {
            let error = new Error('Id not provided');
            error.status = 400;
            throw error;
        }
        else {
            if (mongoose.isValidObjectId(centerId)) {
                Location.findById(mongoose.Types.ObjectId(centerId)).then((centerData) => {
                    if (!centerData) {
                        let error = new Error('Error while Initiating proposal');
                        error.status = 503;
                        throw error;
                    }
                    else {
                        let Id = `RBO${String(centerData.location).toUpperCase().slice(0, 2)}${String(centerData.center).toUpperCase().slice(0, 2)}${("0" + date.getDate()).slice(-2)}${("0" + (date.getMonth() + 1)).slice(-2)}${("0" + date.getHours()).slice(-2)}${("0" + date.getMinutes()).slice(-2)}`
                        res.status(202).send({
                            "Message": "Proposal Initiated Successfully",
                            "Id": Id
                        })
                    }
                })
            }
            else {
                let error = new Error('Id is Invalid');
                error.status = 400;
                throw error;
            }
        }
        
    }
    catch (err) {
        if (!err.status) err.status = 500;
        if (!err.message) err.message = 'Error while creating proposal Id';
        throw err;
    }
};

const addClientInfo = (req, res, next) => {
    let Id = req.params.Id;
    let data = req.body;
    data = { ...data, _id: Id };
    try {
        if (!Id) {
            let error = new Error('Id not provided!');
            error.status = 406;
            throw error;
        }
        Proposal.findById(Id).then((result) => {
            if (result) {
                let error = new Error('Client Info cannot be added twice');
                error.status = 400;
                throw error;
            }
            else {
                let proposal = new Proposal(data);
                proposal.save().then((proposal) => {
                    if (!proposal) {
                        let error = new Error('Error while adding Client Info');
                        error.status = 400;
                        throw error;
                    }
                    else {
                        // require('../../../assets/layout/json/Salarpuria.json')
                        LogController.proposal.create(Id, data.clientName);
                        let layoutData = require(path.join('..', '..', '..', 'assets', 'layout', 'json', `${proposal.location}_${proposal.center}.json`));
                        res.status(202).send({
                            "Message": "Client Info added Successfully!",
                            "AvailableNoOfSeatsInLayout": layoutData.AvailableNoOfSeats,
                            "TotalNoOfSeatsInLayout": layoutData.TotalNoOfSeats
                        })
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
        if (!err.message) err.message = 'Error when adding client Info';
        if (!err.status) err.status = 400;
        next(err);
    }
}

// const addClientInfo = (req, res, next) => {
//     let Id = req.params.Id;
//     let data = req.body;
//     try {
//         if (!Id) {
//             let error = new Error('Id not provided!');
//             error.status = 406;
//             throw error;
//         }
//         Proposal.findById(Id).then((proposal) => {
//             if (!proposal) {
//                 let error = new Error('Proposal not found with given Id');
//                 error.status = 404;
//                 throw error;
//             }
//             else {
//                 try {
//                     let clientInfoField = ['salesTeam', 'salesHead', 'location', 'center', 'broker', 'spocName', 'clientName'];
//                     clientInfoField.forEach((key) => {
//                         if (typeof (proposal?.[key]) === 'object') {
//                             let subField = Object.keys(proposal?.[key]);
//                             subField.forEach((subKey) => {
//                                 if (proposal?.[key]?.[subKey]) {
//                                     let error = new Error('Client Info cannot be added twice');
//                                     throw error;
//                                 }
//                             })
//                         }
//                         else if (proposal?.[key]) {
//                             let error = new Error('Client Info cannot be added twice');
//                             throw error;
//                         }
//                     })
//                 }
//                 catch (err) {
//                     if (!err.status) err.status = 406;
//                     if (!err.message) err.message = 'Client Info cannot be added twice';
//                     throw err;
//                 }
//                 Proposal.updateOne({ _id: Id }, { $set: data }).then((result) => {
//                     if (result.acknowledged === true) {
//                         if (result.modifiedCount > 0) {
//                             LogController.proposal.create(Id, data.clientName);                                              // generation proposal Log
//                             res.status(202).send({
//                                 "Message": "Client Info added Successfully!"
//                             });
//                         } else {
//                             let error = new Error('Proposal not found with given Id');
//                             error.status = 404;
//                             throw error;
//                         }
//                     } else {
//                         let error = new Error('Error when adding client Info');
//                         throw error;
//                     }
//                 }).catch((err) => {
// if (!err.message) err.message = 'Error when adding client Info';
// if (!err.status) err.status = 400;
// next(err);
//                 })
//             }
//         }).catch((err) => {
// if (!err.message) err.message = 'Error when adding client Info';
// if (!err.status) err.status = 400;
// next(err);
//         })
//     }
//     catch (err) {
//         if (!err.status) err.status = 400;
//         if (!err.message) err.message = 'Error while adding client Info';
//         throw err;
//     }
// }

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
    let consolidatedSeats = false;
    let seatAvailability = true;
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




                // Deciding in which workstation seats should be selected

                try {
                    let location = proposal.center;
                    let requiredNoOfSeats = proposal.totalNoOfSeatsSelected;
                    let layoutData = require(path.join('..', '..', '..', 'assets', 'layout', 'json', `${location}.json`))
                    let workStationToBeSelectedIn = [];
                    let seatsToBeSelected = requiredNoOfSeats;
                    
                    layoutData.workstations.forEach((workStation) => {
                        if (requiredNoOfSeats <= workStation.AvailableNoOfSeats && workStationToBeSelectedIn.length <= 0) {
                            workStationId = workStation._id;
                            workStationToBeSelectedIn = [...workStationToBeSelectedIn, { workStationId: workStation._id, seatesToBeSelectedInWorkstation: requiredNoOfSeats }]
                        }
                    });
                    if (workStationToBeSelectedIn.length <= 0) {
                        if (seatsToBeSelected <= layoutData.AvailableNoOfSeats) {
                            layoutData.workstations.forEach((workStation) => {
                                if (seatsToBeSelected !== 0) {
                                    if (workStation.AvailableNoOfSeats <= seatsToBeSelected) {
                                        seatsToBeSelected -= workStation.AvailableNoOfSeats;
                                        workStationToBeSelectedIn = [...workStationToBeSelectedIn, { workStationId: workStation._id, seatesToBeSelectedInWorkstation: workStation.AvailableNoOfSeats }];

                                    }
                                    else if (workStation.AvailableNoOfSeats >= seatsToBeSelected) {
                                        workStationToBeSelectedIn = [...workStationToBeSelectedIn, { workStationId: workStation._id, seatesToBeSelectedInWorkstation: seatsToBeSelected }];
                                        seatsToBeSelected = 0;
                                    }
                                }
                            })

                                                        
                                consolidatedSeats = true;
                        }
                        else {
                            seatAvailability = false;
                        }
                    }
                }
                catch (err) {
                    if (!err.message) err.message = 'Error while calculating seats';
                    throw err;
                }

                Proposal.updateOne({ _id: Id }, { $set: data }).then((result) => {
                    if (result.acknowledged === true) {
                        if (result.modifiedCount > 0) {
                            LogController.proposal.update(Id, {logMessage:'Added Requirement Info'});
                            Proposal.find()
                                .where('location').equals(proposal.location).where('center').equals(proposal.center)
                                .where('clientName').equals(proposal.clientName)
                                .where('totalNoOfSeatsSelected').gte(proposal.totalNoOfSeatsSelected - ((proposal.totalNoOfSeatsSelected * 5) / 100)).lte(proposal.totalNoOfSeatsSelected + ((proposal.totalNoOfSeatsSelected * 5) / 100))
                                .then((result) => {
                                    if (result.length > 1) {
                                        res.status(202).send({
                                            "Message": "Requirement added Successfully!",
                                            "conflict": true,
                                            "seatsAvailability": seatAvailability,
                                            "consolidatedSeats": consolidatedSeats
                                        })
                                    }
                                    else {
                                        res.status(202).send({
                                            "Message": "Requirement added Successfully!",
                                            "conflict": false,
                                            "seatsAvailability": seatAvailability,
                                            "consolidatedSeats": consolidatedSeats
                                        })
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