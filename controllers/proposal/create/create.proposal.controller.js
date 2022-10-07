const mongoose = require("mongoose");
const Proposal = require("../../../models/proposal/proposal.model")

const initProposal = (req, res, next) => {
    let proposal = new Proposal();
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
        Proposal.findById(mongoose.Types.ObjectId(Id)).then((proposal) => {
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
                Proposal.updateOne({ _id: mongoose.Types.ObjectId(Id) }, { $set: data }).then((result) => {
                    if (result.acknowledged === true) {
                        if (result.modifiedCount > 0) {
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
        Proposal.findById(mongoose.Types.ObjectId(Id)).then((proposal) => {
            if (!proposal) {
                let error = new Error('Proposal not found with given Id');
                error.status = 404;
                throw error;
            }
            else {
                try {
                    let requirementFields = ['workStation', 'cabin', 'meetingRooms'];
                    requirementFields.forEach((mainField) => {
                        if (proposal?.[mainField]) {
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

                Proposal.updateOne({ _id: mongoose.Types.ObjectId(Id) }, { $set: data }).then((result) => {
                    if (result.acknowledged === true) {
                        if (result.modifiedCount > 0) {
                            Proposal.find()
                                .where('workStation.workStationNumber').gte(data.workStation.workStationNumber - ((data.workStation.workStationNumber * 5) / 100)).lte(data.workStation.workStationNumber + ((data.workStation.workStationNumber * 5) / 100))
                                .where('workStation.storageRoomNumber').gte(data.workStation.storageRoomNumber - ((data.workStation.storageRoomNumber * 5) / 100)).lte(data.workStation.storageRoomNumber - ((data.workStation.storageRoomNumber * 5) / 100))
                                .where('workStation.cafeteriaNumber').gte(data.workStation.cafeteriaNumber - ((data.workStation.cafeteriaNumber * 5) / 100)).lte(data.workStation.cafeteriaNumber - ((data.workStation.cafeteriaNumber * 5) / 100))
                                .where('cabin.cabinNumber').gte(data.cabin.cabinNumber - ((data.cabin.cabinNumber * 5) / 100)).lte(data.cabin.cabinNumber - ((data.cabin.cabinNumber * 5) / 100))
                                .where('cabin.visitorMeetingRoom.visitorMeetingRoomNumber').gte(data.cabin.visitorMeetingRoom.visitorMeetingRoomNumber - ((data.cabin.visitorMeetingRoom.visitorMeetingRoomNumber * 5) / 100)).lte(data.cabin.visitorMeetingRoom.visitorMeetingRoomNumber - ((data.cabin.visitorMeetingRoom.visitorMeetingRoomNumber * 5) / 100))
                                .where('meetingRooms.meetingRoomsNumber').gte(data.meetingRooms.meetingRoomsNumber - ((data.meetingRooms.meetingRoomsNumber * 5) / 100)).lte(data.meetingRooms.meetingRoomsNumber - ((data.meetingRooms.meetingRoomsNumber * 5) / 100))
                                .where('center').equals(data.center)
                                .where('location').equals(data.location)
                                .then((result) => {
                                    console.log(result);
                                }).catch((err) => {
                                    console.log(err);
                                });
                            res.status(202).send({
                                "Message": "Requirement added Successfully!"
                            });
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
    /////////////////////////////////////////////////
    // Proposal.find().where("workStation").elemMatch((workstation) => {
    //     workstation.where('workStationNumber').gt(data.workStation.workStationNumber - ((data.workStation.workStationNumber * 5) / 100)).lt(data.workStation.workStationNumber + ((data.workStation.workStationNumber * 5) / 100));
    //     workstation.where('storageRoomNumber').gt(data.workStation.storageRoomNumber - ((data.workStation.storageRoomNumber * 5) / 100)).lt(data.workStation.storageRoomNumber + ((data.workStation.storageRoomNumber * 5) / 100));
    //     workstation.where('cafeteriaNumber').gt((data.workStation.cafeteriaNumber - (data.workStation.cafeteriaNumber * 5) / 100)).lt((data.workStation.cafeteriaNumber + (data.workStation.cafeteriaNumber * 5) / 100));
    // }).where("cabin").elemMatch((cabin) => {
    //     cabin.where('cabinNumber').gt((data.cabin.cabinNumber * 5) / 100).lt((data.cabin.cabinNumber * 5) / 100);
    //     cabin.where('visitorMeetingRoom').elemMatch((visitorMeetingRoom) => {
    //         visitorMeetingRoom.where("visitorMeetingRoomNumber").gt((data.cabin.visitorMeetingRoom.visitorMeetingRoomNumber * 5) / 100).lt((data.cabin.visitorMeetingRoom.visitorMeetingRoomNumber * 5) / 100);
    //     })
    // }).where("meetingRooms").elemMatch((meetingRooms) => {
    //     meetingRooms.where("meetingRoomsNumber").gt(data.meetingRooms.meetingRoomsNumber - ((data.meetingRooms.meetingRoomsNumber * 5) / 100)).lt(data.meetingRooms.meetingRoomsNumber + ((data.meetingRooms.meetingRoomsNumber * 5) / 100));
    // }).countDocuments((err, count) => {
    //     if (err) next(err);
    //     if (count) res.send({
    //         "count": count
    //     });
    //     else res.send('lasdjfa');
    // })
    // console.log(data.workStation.workStationNumber);
    // Proposal.find().where('workStation').gt(0)
    //     .then((data) => {
    //     res.send({ 'count': data.length, "min": data.workStation.workStationNumber - ((data.workStation.workStationNumber * 5) / 100), "max": data.workStation.workStationNumber + ((data.workStation.workStationNumber * 5) / 100) });
    // }).catch((err) => {
    //     next(err);
    // });
    // Proposal.find({'workStation.workStationNumber'})
    // Proposal.find({}).where("workStation").gt(data.workStation.workStationNumber - ((data.workStation.workStationNumber * 5) / 100)).lt(data.workStation.workStationNumber + ((data.workStation.workStationNumber * 5) / 100)).then((data) => {
    //     res.send({ 'count': data.length, "min": data.workStation.workStationNumber - ((data.workStation.workStationNumber * 5) / 100), "max": data.workStation.workStationNumber + ((data.workStation.workStationNumber * 5) / 100) });
    // }).catch((err) => {
    //     next(err);
    // })
}

const create = {
    init: initProposal,
    addClientInfo: addClientInfo,
    addProposalRequirement: addProposalRequirement
};

module.exports = create;