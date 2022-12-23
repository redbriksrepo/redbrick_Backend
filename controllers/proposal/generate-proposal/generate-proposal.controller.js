
const PDFDocument = require('pdfkit');
const path = require('path');
const Proposal = require('../../../models/proposal/proposal.model');
const { default: mongoose } = require('mongoose');
const fs = require('fs');
const nodemailer = require('nodemailer');
const LogController = require('../../log/main.log.controller');
const ProposalLog = require('../../../models/proposal-log/proposal-log.model');
const Location = require('../../../models/location/location.model');

const generateProposal = (req, res, next) => {
    let data = req.body;
    let Id = req.params.Id;

    Proposal.findById(Id).then((proposal) => {
        if (!proposal) {
            let error = new Error('Invalid Proposal Id');
            error.status = 400;
            throw error;
        }

        Location.findOne({ location: proposal.location, center: proposal.center }).select('perSeatPrice').then((locationdata) => {

            data.finalOfferAmmount = proposal.totalNoOfSeatsSelected * locationdata.perSeatPrice;

            Proposal.updateOne({ _id: Id }, { $set: data }).then((result) => {
                if (result.acknowledged === true) {
                    if (result.modifiedCount > 0) {
                        next();
                    }
                    else {
                        let error = new Error('Error while generation proposal with additional Data');
                        throw error;
                    }
                }
                else {
                    let error = new Error('Error while generating Proposal');
                    throw error;
                }
            }).catch((err) => {
                if (!err.message) err.message = 'Error while generatin propoasl';
                throw err;
            })
        }).catch((err) => {
            if (!err.message) err.message = 'Error while generatin propoasl';
            throw err;
        })

    }).catch((err) => {
        if (!err.message) err.message = 'Error while generatin propoasl';
        next(err);
    })
}

const generateProposalPDF = (req, res, next) => {
    let Id = req.params.Id;
    
    // let location;
    // let requiredNoOfSeats;
    
    Proposal.findById(Id).then((proposal) => {
        
        if (!proposal) {
            let error = new Error('Invalid Proposal Id');
            throw error;
        }
        
        let selectFrom = req.params.selectFrom || proposal.selectFrom;
        let location = proposal.center;
        let requiredNoOfSeats = proposal.totalNoOfSeatsSelected;
        let workStationId;
        // let jsonPath = path.join()

        let layoutData = require(path.join('..', '..', '..', 'assets', 'layout', 'json', `${proposal.location}_${proposal.center}.json`))
        let workStationToBeSelectedIn = [];
        // let layoutData = require(`../../../assets/layout/json/${location}.json`);/


        // Deciding in which workstation seats should be selected

        try {
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
                    if (seatsToBeSelected !== 0) {
                        let error = new Error('Space not Available!');
                        error.status = 404;
                        throw error;
                    }
                }
            }
            // console.log(workStationToBeSelectedIn);
            if (workStationToBeSelectedIn.length <= 0) {
                let error = new Error('Space not available!');
                error.status = 404;
                throw error;
            }
        }
        catch (err) {
            if (!err.message) err.message = 'Error while selecting Zone';
            throw err;
        }
        try {
            const doc = new PDFDocument({ size: [800, 566], margin: 0 });
            doc.pipe(fs.createWriteStream(`./assets/proposal/generated/${proposal._id}.pdf`));

            // First Page ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            doc.image('./assets/proposal/image/proposal-layout__page1-background.png', 0, 0, { width: 800, height: 566 });
            doc.image('./assets/proposal/image/proposal-layout__page1-logo.png', 200, 350, { scale: 0.25 });
            doc.addPage();

            // Second Page /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            doc.image('./assets/proposal/image/proposal-layout__page2-image.png', 0, 0, { width: 800, height: 566 });
            doc.addPage();

            // Third Page //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            doc.fontSize(38).text('Our Clients', 0, 10, { width: 800, align: 'center' });
            doc.fontSize(16).fillColor('grey').text('Top clients rely on us for innovatice workspace solutions', 0, 50, { width: 800, align: 'center' }).fontSize(12);
            doc.image('./assets/proposal/image/proposal-layout__page3-our_client.png', 20, 150, { width: 760 });
            doc.addPage();
            doc.image(path.join(__dirname, '..', '..', '..', 'assets', 'layout', 'image', `${proposal.location}_${proposal.center}.png`), { height: 566, align: 'center', valign: 'center' });

            // Generation of layout start from here ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            markSeatsOnLayout = (workstationToSelect) => {
                if (workstationToSelect.workStationId) {
                    let workStationId = workstationToSelect.workStationId;
                    let requiredNoOfSeats = workstationToSelect.seatesToBeSelectedInWorkstation;
                    let workStationData = { ...layoutData.workstations.find((workStation) => workStationId === workStation._id) };
                    let rowComplete = false;
                    let subWorkStationStarted = false;
                    let subWorkStationData;

                    // If it is defined to start the selection of seat from right then only it will only select from right otherwise from left side
                    if (selectFrom === 'right') {
                        for (let i = 1; i <= requiredNoOfSeats; i++) {
                            // If row is completed
                            if (rowComplete === true) {
                                workStationData.selectedAreaXAxisOpposite -= workStationData.sizeOfSeat.width;
                                workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                rowComplete = false;
                            }
                            // Checking for Pillar and drawing
                            workStationData.pillarPosition.forEach((pillar) => {
                                if (
                                    (workStationData.selectedAreaXAxisOpposite > (pillar.startingXPositionOpposite - 1)) &&
                                    (workStationData.selectedAreaXAxisOpposite < (pillar.startingXPositionOpposite + 1)) &&
                                    (workStationData.selectedAreaYAxis > (pillar.startingYPosition - 1)) &&
                                    (workStationData.selectedAreaYAxis < (pillar.startingYPosition + 1))
                                ) {
                                    doc.polygon(
                                        [workStationData.selectedAreaXAxisOpposite, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxisOpposite - pillar.pillarWidth, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxisOpposite - pillar.pillarWidth, workStationData.selectedAreaYAxis + pillar.pillarHeight],
                                        [workStationData.selectedAreaXAxisOpposite, workStationData.selectedAreaYAxis + pillar.pillarHeight],
                                    ).fillOpacity(0.4).fill('green');
                                    workStationData.selectedAreaYAxis += pillar.pillarHeight;
                                }
                            })
                            // checking for partition and drawing
                            workStationData.partition.forEach((gap) => {
                                if ((workStationData.selectedAreaXAxisOpposite > (gap.startingPositionOpposite - 1)) && (workStationData.selectedAreaXAxisOpposite < (gap.startingPositionOpposite + 1))) {
                                    workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                    doc.polygon(
                                        [workStationData.selectedAreaXAxisOpposite, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxisOpposite - gap.width, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxisOpposite - gap.width, workStationData.selectedAreaYAxis + gap.height],
                                        [workStationData.selectedAreaXAxisOpposite, workStationData.selectedAreaYAxis + gap.height]
                                    ).fillOpacity(0.4).fill("red");
                                    rowComplete = false;
                                    workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                    workStationData.selectedAreaXAxisOpposite -= gap.width;
                                }
                            });
                            // checking for gap between workstation and drawing it
                            workStationData.gapPosition.forEach((gap) => {
                                if ((workStationData.selectedAreaXAxisOpposite > (gap.startingPositonOpposite - 1)) && (workStationData.selectedAreaXAxisOpposite < (gap.startingPositonOpposite + 1))) {
                                    workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                    doc.polygon(
                                        [workStationData.selectedAreaXAxisOpposite, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxisOpposite - gap.pillarWidth, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxisOpposite - gap.pillarWidth, workStationData.selectedAreaYAxis + gap.pillarHeight],
                                        [workStationData.selectedAreaXAxisOpposite, workStationData.selectedAreaYAxis + gap.pillarHeight]
                                    ).fillOpacity(0.4).fill("green");
                                    rowComplete = false;
                                    workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                    workStationData.selectedAreaXAxisOpposite -= gap.pillarWidth;
                                }
                            });
                            // checking for partition and drawing
                            workStationData.partition.forEach((gap) => {
                                if ((workStationData.selectedAreaXAxisOpposite > (gap.startingPositionOpposite - 1)) && (workStationData.selectedAreaXAxisOpposite < (gap.startingPositionOpposite + 1))) {
                                    workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                    doc.polygon(
                                        [workStationData.selectedAreaXAxisOpposite, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxisOpposite - gap.width, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxisOpposite - gap.width, workStationData.selectedAreaYAxis + gap.height],
                                        [workStationData.selectedAreaXAxisOpposite, workStationData.selectedAreaYAxis + gap.height]
                                    ).fillOpacity(0.4).fill("red");
                                    rowComplete = false;
                                    workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                    workStationData.selectedAreaXAxisOpposite -= gap.width;
                                }
                            });
                            // checking for pillar and drawing;
                            workStationData.pillarPosition.forEach((pillar) => {
                                if (
                                    (workStationData.selectedAreaXAxisOpposite > (pillar.startingXPositionOpposite - 1)) &&
                                    (workStationData.selectedAreaXAxisOpposite < (pillar.startingXPositionOpposite + 1)) &&
                                    (workStationData.selectedAreaYAxis > (pillar.startingYPosition - 1)) &&
                                    (workStationData.selectedAreaYAxis < (pillar.startingYPosition + 1))
                                ) {
                                    doc.polygon(
                                        [workStationData.selectedAreaXAxisOpposite, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxisOpposite - pillar.pillarWidth, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxisOpposite - pillar.pillarWidth, workStationData.selectedAreaYAxis + pillar.pillarHeight],
                                        [workStationData.selectedAreaXAxisOpposite, workStationData.selectedAreaYAxis + pillar.pillarHeight],
                                    ).fillOpacity(0.4).fill('green');
                                    workStationData.selectedAreaYAxis += pillar.pillarHeight;
                                }
                            })
                            // checking if sub-Workstation started or not
                            workStationData.subWorkStationArea.forEach((subWorkStation) => {

                                if ((workStationData.selectedAreaXAxisOpposite > (subWorkStation.startingXAxisOpposite - 1)) && (workStationData.selectedAreaXAxisOpposite < (subWorkStation.startingXAxisOpposite + 1))) {
                                    subWorkStationStarted = true;
                                    subWorkStationData = { ...subWorkStation };
                                }
                            })
                            // checking if row is completed till now or not;
                            if ((workStationData.selectedAreaYAxis > (workStationData.lastYAxis - 1)) && (workStationData.selectedAreaYAxis < (workStationData.lastYAxis + 1))) {
                                rowComplete = true;
                            }
                            // restricting the selection of seat if sub-WorkStation started
                            if (subWorkStationStarted === false) {
                                // if row completed before selecting the seat then it should not count the current selection
                                if (rowComplete === true) {
                                    i--;
                                }
                                // if row is not completed till now then it should select seat
                                else {
                                    doc.polygon(
                                        [workStationData.selectedAreaXAxisOpposite, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxisOpposite - workStationData.sizeOfSeat.width, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxisOpposite - workStationData.sizeOfSeat.width, workStationData.selectedAreaYAxis + workStationData.sizeOfSeat.height],
                                        [workStationData.selectedAreaXAxisOpposite, workStationData.selectedAreaYAxis + workStationData.sizeOfSeat.height]
                                    ).fillOpacity(0.4).lineWidth(0.2).stroke('blue');
                                    workStationData.selectedAreaYAxis += workStationData.sizeOfSeat.height;
                                }
                            }
                            // checking if row is completed after selection of seat
                            if ((workStationData.selectedAreaYAxis > (workStationData.lastYAxis - 1)) && (workStationData.selectedAreaYAxis < (workStationData.lastYAxis + 1))) {
                                rowComplete = true;
                            }
                            // if Sub-Workstation started
                            if (subWorkStationStarted === true) {
                                let subrowComplete;
                                let subWorkStationLastCheck = false;
                                for (let j = 1; j <= subWorkStationData.AvailableNoOfSeats; j++) {
                                    // checking if Sub-Workstation row completed or not
                                    if (subrowComplete === true) {
                                        subWorkStationData.selectedAreaXAxisOpposite -= subWorkStationData.sizeOfSeat.width;
                                        subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                        subrowComplete = false;
                                    }
                                    // checking if pillar started in Sub-WorkStation
                                    subWorkStationData.pillarPosition.forEach((pillar) => {
                                        if ((subWorkStationData.selectedAreaXAxisOpposite > (pillar.startingXPositionOpposite - 1)) &&
                                            (subWorkStationData.selectedAreaXAxisOpposite < (pillar.startingXPositionOpposite + 1)) &&
                                            (subWorkStationData.selectedAreaYAxis > (pillar.startingYPosition - 1)) &&
                                            (subWorkStationData.selectedAreaYAxis < (pillar.startingYPosition + 1))
                                        ) {
                                            doc.polygon(
                                                [subWorkStationData.selectedAreaXAxisOpposite, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxisOpposite - pillar.pillarWidth, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxisOpposite - pillar.pillarWidth, subWorkStationData.selectedAreaYAxis + pillar.pillarHeight],
                                                [subWorkStationData.selectedAreaXAxisOpposite, subWorkStationData.selectedAreaYAxis + pillar.pillarHeight]
                                            ).fillOpacity(0.4).fill("green");
                                            subWorkStationData.selectedAreaYAxis += pillar.pillarHeight;
                                        }
                                    });
                                    // checking if partition started in Sub-WorkStation
                                    subWorkStationData.partition.forEach((gap) => {
                                        if ((subWorkStationData.selectedAreaXAxisOpposite > (gap.startingPositionOpposite - 1)) && (subWorkStationData.selectedAreaXAxisOpposite < (gap.startingPositionOpposite + 1))) {
                                            subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                            doc.polygon(
                                                [subWorkStationData.selectedAreaXAxisOpposite, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxisOpposite - gap.width, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxisOpposite - gap.width, subWorkStationData.selectedAreaYAxis + gap.height],
                                                [subWorkStationData.selectedAreaXAxisOpposite, subWorkStationData.selectedAreaYAxis + gap.height]
                                            ).fillOpacity(0.4).fill("red");
                                            subrowComplete = false;
                                            subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                            subWorkStationData.selectedAreaXAxisOpposite -= gap.width;
                                        }
                                    });
                                    // checking if gap started in Sub-WorkStation
                                    subWorkStationData.gapPosition.forEach((gap) => {
                                        if ((subWorkStationData.selectedAreaXAxisOpposite > (gap.startingPositonOpposite - 1)) && (subWorkStationData.selectedAreaXAxisOpposite < (gap.startingPositonOpposite + 1))) {
                                            subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                            doc.polygon(
                                                [subWorkStationData.selectedAreaXAxisOpposite, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxisOpposite - gap.pillarWidth, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxisOpposite - gap.pillarWidth, subWorkStationData.selectedAreaYAxis + gap.pillarHeight],
                                                [subWorkStationData.selectedAreaXAxisOpposite, subWorkStationData.selectedAreaYAxis + gap.pillarHeight]
                                            ).fillOpacity(0.4).fill("green");
                                            rowComplete = false;
                                            subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                            subWorkStationData.selectedAreaXAxisOpposite -= gap.pillarWidth;
                                        }
                                    });
                                    // checking if partition started in Sub-WorkStation
                                    subWorkStationData.partition.forEach((gap) => {
                                        if ((subWorkStationData.selectedAreaXAxisOpposite > (gap.startingPositionOpposite - 1)) && (subWorkStationData.selectedAreaXAxisOpposite < (gap.startingPositionOpposite + 1))) {
                                            subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                            doc.polygon(
                                                [subWorkStationData.selectedAreaXAxisOpposite, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxisOpposite - gap.width, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxisOpposite - gap.width, subWorkStationData.selectedAreaYAxis + gap.height],
                                                [subWorkStationData.selectedAreaXAxisOpposite, subWorkStationData.selectedAreaYAxis + gap.height]
                                            ).fillOpacity(0.4).fill("red");
                                            subrowComplete = false;
                                            subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                            subWorkStationData.selectedAreaXAxisOpposite -= gap.width;
                                        }
                                    });
                                    // checking if pillar started in Sub-WorkStation
                                    subWorkStationData.pillarPosition.forEach((pillar) => {
                                        if ((subWorkStationData.selectedAreaXAxisOpposite > (pillar.startingXPositionOpposite - 1)) &&
                                            (subWorkStationData.selectedAreaXAxisOpposite < (pillar.startingXPositionOpposite + 1)) &&
                                            (subWorkStationData.selectedAreaYAxis > (pillar.startingYPosition - 1)) &&
                                            (subWorkStationData.selectedAreaYAxis < (pillar.startingYPosition + 1))
                                        ) {
                                            doc.polygon(
                                                [subWorkStationData.selectedAreaXAxisOpposite, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxisOpposite - pillar.pillarWidth, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxisOpposite - pillar.pillarWidth, subWorkStationData.selectedAreaYAxis + pillar.pillarHeight],
                                                [subWorkStationData.selectedAreaXAxisOpposite, subWorkStationData.selectedAreaYAxis + pillar.pillarHeight]
                                            ).fillOpacity(0.4).fill("green");
                                            subWorkStationData.selectedAreaYAxis += pillar.pillarHeight;
                                        }
                                    });
                                    // checking if Sub-Workstation row is completed or not till now
                                    if ((subWorkStationData.selectedAreaYAxis > (subWorkStationData.lastYAxis - 1)) && (subWorkStationData.selectedAreaYAxis < (subWorkStationData.lastYAxis + 1))) {
                                        subrowComplete = true;
                                    }
                                    // restricting the selection of seat if last sub-workstation check is running
                                    if (subWorkStationLastCheck === false) {
                                        // if row is completed before selection of seat then decreasing the number of seat selected
                                        if (subrowComplete === true) {
                                            i--;
                                            j--;
                                        }
                                        // if row is not completed till now
                                        else {
                                            doc.polygon(
                                                [subWorkStationData.selectedAreaXAxisOpposite, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxisOpposite - subWorkStationData.sizeOfSeat.width, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxisOpposite - subWorkStationData.sizeOfSeat.width, subWorkStationData.selectedAreaYAxis + subWorkStationData.sizeOfSeat.height],
                                                [subWorkStationData.selectedAreaXAxisOpposite, subWorkStationData.selectedAreaYAxis + subWorkStationData.sizeOfSeat.height]
                                            ).fillOpacity(0.4).lineWidth(0.2).stroke('red');
                                        }
                                    }
                                    subWorkStationData.selectedAreaYAxis += subWorkStationData.sizeOfSeat.height;
                                    // checking if row is completed after selection of seat
                                    if ((subWorkStationData.selectedAreaYAxis > (subWorkStationData.lastYAxis - 1)) && (subWorkStationData.selectedAreaYAxis < (subWorkStationData.lastYAxis + 1))) {
                                        subrowComplete = true;
                                    }
                                    // reached the limit of total no of seat could be selected
                                    if ((i === Number(requiredNoOfSeats)) || (j === Number(subWorkStationData.AvailableNoOfSeats))) {
                                        if (subWorkStationLastCheck === false) {
                                            i--;
                                            j--;
                                            subWorkStationLastCheck = true;
                                        }
                                        else {
                                            workStationData.selectedAreaXAxisOpposite = subWorkStationData.startingXAxis;
                                            break;
                                        }
                                    }
                                    i++;
                                }
                                subWorkStationStarted = false;
                            }
                        }
                    }
                    // starting the default selection of seat from left side.
                    else {
                        for (let i = 1; i <= requiredNoOfSeats; i++) {
                            // If row is completed
                            if (rowComplete === true) {
                                workStationData.selectedAreaXAxis += workStationData.sizeOfSeat.width;
                                workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                rowComplete = false;
                            }
                            // Checking for Pillar and drawing
                            workStationData.pillarPosition.forEach((pillar) => {
                                if (
                                    (workStationData.selectedAreaXAxis > (pillar.startingXPosition - 1)) &&
                                    (workStationData.selectedAreaXAxis < (pillar.startingXPosition + 1)) &&
                                    (workStationData.selectedAreaYAxis > (pillar.startingYPosition - 1)) &&
                                    (workStationData.selectedAreaYAxis < (pillar.startingYPosition + 1))
                                ) {
                                    doc.polygon(
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + pillar.pillarWidth, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + pillar.pillarWidth, workStationData.selectedAreaYAxis + pillar.pillarHeight],
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis + pillar.pillarHeight],
                                    ).fillOpacity(0.4).fill('green');
                                    workStationData.selectedAreaYAxis += pillar.pillarHeight;
                                }
                            })
                            // checking for partition and drawing
                            workStationData.partition.forEach((gap) => {
                                if ((workStationData.selectedAreaXAxis > (gap.startingPosition - 1)) && (workStationData.selectedAreaXAxis < (gap.startingPosition + 1))) {
                                    workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                    doc.polygon(
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + gap.width, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + gap.width, workStationData.selectedAreaYAxis + gap.height],
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis + gap.height]
                                    ).fillOpacity(0.4).fill("red");
                                    rowComplete = false;
                                    workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                    workStationData.selectedAreaXAxis += gap.width;
                                }
                            });
                            // checking for gap between workstation and drawing it
                            workStationData.gapPosition.forEach((gap) => {
                                if ((workStationData.selectedAreaXAxis > (gap.startingPositon - 1)) && (workStationData.selectedAreaXAxis < (gap.startingPositon + 1))) {
                                    workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                    doc.polygon(
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + gap.pillarWidth, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + gap.pillarWidth, workStationData.selectedAreaYAxis + gap.pillarHeight],
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis + gap.pillarHeight]
                                    ).fillOpacity(0.4).fill("green");
                                    rowComplete = false;
                                    workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                    workStationData.selectedAreaXAxis += gap.pillarWidth;
                                }
                            });
                            // checking for partition and drawing
                            workStationData.partition.forEach((gap) => {
                                if ((workStationData.selectedAreaXAxis > (gap.startingPosition - 1)) && (workStationData.selectedAreaXAxis < (gap.startingPosition + 1))) {
                                    workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                    doc.polygon(
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + gap.width, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + gap.width, workStationData.selectedAreaYAxis + gap.height],
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis + gap.height]
                                    ).fillOpacity(0.4).fill("red");
                                    rowComplete = false;
                                    workStationData.selectedAreaYAxis = workStationData.startingYAxis;
                                    workStationData.selectedAreaXAxis += gap.width;
                                }
                            });
                            // checking for pillar and drawing;
                            workStationData.pillarPosition.forEach((pillar) => {
                                if (
                                    (workStationData.selectedAreaXAxis > (pillar.startingXPosition - 1)) &&
                                    (workStationData.selectedAreaXAxis < (pillar.startingXPosition + 1)) &&
                                    (workStationData.selectedAreaYAxis > (pillar.startingYPosition - 1)) &&
                                    (workStationData.selectedAreaYAxis < (pillar.startingYPosition + 1))
                                ) {
                                    doc.polygon(
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + pillar.pillarWidth, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + pillar.pillarWidth, workStationData.selectedAreaYAxis + pillar.pillarHeight],
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis + pillar.pillarHeight],
                                    ).fillOpacity(0.4).fill('green');
                                    workStationData.selectedAreaYAxis += pillar.pillarHeight;
                                }
                            })
                            // checking if sub-Workstation started or not
                            workStationData.subWorkStationArea.forEach((subWorkStation) => {

                                if ((workStationData.selectedAreaXAxis > (subWorkStation.startingXAxis - 1)) && (workStationData.selectedAreaXAxis < (subWorkStation.startingXAxis + 1))) {
                                    subWorkStationStarted = true;
                                    subWorkStationData = { ...subWorkStation };
                                }
                            })
                            // checking if row is completed till now or not;
                            if ((workStationData.selectedAreaYAxis > (workStationData.lastYAxis - 1)) && (workStationData.selectedAreaYAxis < (workStationData.lastYAxis + 1))) {
                                rowComplete = true;
                            }
                            // restricting the selection of seat if sub-WorkStation started
                            if (subWorkStationStarted === false) {
                                // if row completed before selecting the seat then it should not count the current selection
                                if (rowComplete === true) {
                                    i--;
                                }
                                // if row is not completed till now then it should select seat
                                else {
                                    doc.polygon(
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + workStationData.sizeOfSeat.width, workStationData.selectedAreaYAxis],
                                        [workStationData.selectedAreaXAxis + workStationData.sizeOfSeat.width, workStationData.selectedAreaYAxis + workStationData.sizeOfSeat.height],
                                        [workStationData.selectedAreaXAxis, workStationData.selectedAreaYAxis + workStationData.sizeOfSeat.height]
                                    ).fillOpacity(0.4).lineWidth(0.2).stroke('blue');
                                    workStationData.selectedAreaYAxis += workStationData.sizeOfSeat.height;
                                }
                            }
                            // checking if row is completed after selection of seat
                            if ((workStationData.selectedAreaYAxis > (workStationData.lastYAxis - 1)) && (workStationData.selectedAreaYAxis < (workStationData.lastYAxis + 1))) {
                                rowComplete = true;
                            }
                            // if Sub-Workstation started
                            if (subWorkStationStarted === true) {
                                let subrowComplete;
                                let subWorkStationLastCheck = false;
                                for (let j = 1; j <= subWorkStationData.AvailableNoOfSeats; j++) {
                                    // if row completed in Sub-Workstation
                                    if (subrowComplete === true) {
                                        subWorkStationData.selectedAreaXAxis += subWorkStationData.sizeOfSeat.width;
                                        subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                        subrowComplete = false;
                                    }
                                    // checking for pillar in current Sub-Workstation
                                    subWorkStationData.pillarPosition.forEach((pillar) => {
                                        if ((subWorkStationData.selectedAreaXAxis > (pillar.startingXPosition - 1)) &&
                                            (subWorkStationData.selectedAreaXAxis < (pillar.startingXPosition + 1)) &&
                                            (subWorkStationData.selectedAreaYAxis > (pillar.startingYPosition - 1)) &&
                                            (subWorkStationData.selectedAreaYAxis < (pillar.startingYPosition + 1))
                                        ) {
                                            doc.polygon(
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + pillar.pillarWidth, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + pillar.pillarWidth, subWorkStationData.selectedAreaYAxis + pillar.pillarHeight],
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis + pillar.pillarHeight]
                                            ).fillOpacity(0.4).fill("green");
                                            subWorkStationData.selectedAreaYAxis += pillar.pillarHeight;
                                        }
                                    })
                                    // checking for partition in current Sub-Workstation
                                    subWorkStationData.partition.forEach((gap) => {
                                        if ((subWorkStationData.selectedAreaXAxis > (gap.startingPosition - 1)) && (subWorkStationData.selectedAreaXAxis < (gap.startingPosition + 1))) {
                                            subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                            doc.polygon(
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + gap.width, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + gap.width, subWorkStationData.selectedAreaYAxis + gap.height],
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis + gap.height]
                                            ).fillOpacity(0.4).fill("red");
                                            rowComplete = false;
                                            subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                            subWorkStationData.selectedAreaXAxis += gap.width;
                                        }
                                    });
                                    // checking for gap in current Sub-Workstation
                                    subWorkStationData.gapPosition.forEach((gap) => {
                                        if ((subWorkStationData.selectedAreaXAxis > (gap.startingPositon - 1)) && (subWorkStationData.selectedAreaXAxis < (gap.startingPositon + 1))) {
                                            subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                            doc.polygon(
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + gap.pillarWidth, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + gap.pillarWidth, subWorkStationData.selectedAreaYAxis + gap.pillarHeight],
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis + gap.pillarHeight]
                                            ).fillOpacity(0.4).fill("green");
                                            rowComplete = false;
                                            subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                            subWorkStationData.selectedAreaXAxis += gap.pillarWidth;
                                        }
                                    });
                                    // checking for partition in current Sub-Workstation
                                    subWorkStationData.partition.forEach((gap) => {
                                        if ((subWorkStationData.selectedAreaXAxis > (gap.startingPosition - 1)) && (subWorkStationData.selectedAreaXAxis < (gap.startingPosition + 1))) {
                                            subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                            doc.polygon(
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + gap.width, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + gap.width, subWorkStationData.selectedAreaYAxis + gap.height],
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis + gap.height]
                                            ).fillOpacity(0.4).fill("red");
                                            subrowComplete = false;
                                            subWorkStationData.selectedAreaYAxis = subWorkStationData.startingYAxis;
                                            subWorkStationData.selectedAreaXAxis += gap.width;
                                        }
                                    });
                                    // checking for pillar in current Sub-Workstation
                                    subWorkStationData.pillarPosition.forEach((pillar) => {
                                        if ((subWorkStationData.selectedAreaXAxis > (pillar.startingXPosition - 1)) &&
                                            (subWorkStationData.selectedAreaXAxis < (pillar.startingXPosition + 1)) &&
                                            (subWorkStationData.selectedAreaYAxis > (pillar.startingYPosition - 1)) &&
                                            (subWorkStationData.selectedAreaYAxis < (pillar.startingYPosition + 1))
                                        ) {
                                            doc.polygon(
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + pillar.pillarWidth, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + pillar.pillarWidth, subWorkStationData.selectedAreaYAxis + pillar.pillarHeight],
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis + pillar.pillarHeight]
                                            ).fillOpacity(0.4).fill("green");
                                            subWorkStationData.selectedAreaYAxis += pillar.pillarHeight;
                                        }
                                    })
                                    // checking if row is completed in Sub-Workstation or not;
                                    if ((subWorkStationData.selectedAreaYAxis > (subWorkStationData.lastYAxis - 1)) && (subWorkStationData.selectedAreaYAxis < (subWorkStationData.lastYAxis + 1))) {
                                        subrowComplete = true;
                                    }
                                    // if row completed in Sub-Workstation till now then skip the current count of seat selection
                                    if (subWorkStationLastCheck === false) {
                                        if (subrowComplete === true) {
                                            j--;
                                            i--;
                                        }
                                        else {
                                            doc.polygon(
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + subWorkStationData.sizeOfSeat.width, subWorkStationData.selectedAreaYAxis],
                                                [subWorkStationData.selectedAreaXAxis + subWorkStationData.sizeOfSeat.width, subWorkStationData.selectedAreaYAxis + subWorkStationData.sizeOfSeat.height],
                                                [subWorkStationData.selectedAreaXAxis, subWorkStationData.selectedAreaYAxis + subWorkStationData.sizeOfSeat.height]
                                            ).fillOpacity(0.4).lineWidth(0.2).stroke('red');
                                        }
                                    }
                                    subWorkStationData.selectedAreaYAxis += subWorkStationData.sizeOfSeat.height;
                                    // check if row is completed in after selecting seat
                                    if ((subWorkStationData.selectedAreaYAxis > (subWorkStationData.lastYAxis - 1)) && (subWorkStationData.selectedAreaYAxis < (subWorkStationData.lastYAxis + 1))) {
                                        subrowComplete = true;
                                    }
                                    // check if required no of seate is selected or the available no of seat in current Sub-Workstation are all selected.
                                    if ((i === Number(requiredNoOfSeats)) || (j === Number(subWorkStationData.AvailableNoOfSeats))) {

                                        // rowComplete = true;
                                        if (subWorkStationLastCheck === false) {
                                            i--;
                                            j--;
                                            subWorkStationLastCheck = true;
                                        }
                                        else {
                                            workStationData.selectedAreaXAxis = subWorkStationData.startingXAxisOpposite;
                                            subWorkStationLastCheck = false;
                                            break;
                                        }
                                    }
                                    i++;
                                }
                                subWorkStationStarted = false;
                            }
                        }
                    }
                }
            }
            workStationToBeSelectedIn.forEach((element) => {
                markSeatsOnLayout(element);
            })

            doc.addPage();
            doc.rect(20, 100, 100, 30).fillAndStroke('#5e5e5e', 'black').fillColor('white').text('Name of Client', 20, 110, { width: 100, align: 'center' })
            doc.rect(120, 100, 660, 30).fillAndStroke('#5e5e5e', 'black').fillColor('white').text(proposal.clientName, 120, 110, { width: 660, align: 'center' });
            doc.rect(20, 130, 100, 30).fillAndStroke('white', 'black').fillColor('black').text('Location', 20, 140, { width: 100, align: 'center' });
            doc.rect(120, 130, 660, 30).fillAndStroke('white', 'black').fillColor('black').text('Meriegold, 301, opp. Solitaire Bussiness Hub, Viman Nagar, Pune, Maharastra 411014', 120, 140, { width: 660, align: 'center' });
            doc.rect(20, 160, 100, 90).fillAndStroke('white', 'black').fillColor('black').text('Requirement Brief', 20, 210, { width: 100, align: 'center' });
            doc.rect(120, 160, 660, 90).fillAndStroke('white', 'black').fillColor('black').text(`As per layout - ${proposal.workstationNumber} ws (4*2 ) + ${proposal.cabinNumber}Nos - Manager Cabin + ${proposal.meetingRoomNumber}Nos - 8pax Meeting Room + 15-seater - Pantry`, 120, 210, { width: 660, align: 'center' });
            doc.rect(20, 250, 100, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('1', 20, 260, { width: 100, align: 'center' });
            doc.rect(120, 250, 180, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('Rent Commencement Date', 120, 260, { width: 180, align: 'center' });
            doc.rect(300, 250, 480, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('1st Aug 2022', 300, 260, { width: 480, align: 'center' });
            doc.rect(20, 280, 100, 30).fillAndStroke('white', 'black').fillColor('black').text('2', 20, 290, { width: 100, align: 'center' });
            doc.rect(120, 280, 180, 30).fillAndStroke('white', 'black').fillColor('black').text('Term', 120, 290, { width: 180, align: 'center' });
            doc.rect(300, 280, 480, 30).fillAndStroke('white', 'black').fillColor('black').text(`${proposal.Tenure} months`, 300, 290, { width: 480, align: 'center' });
            doc.rect(20, 310, 100, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('3', 20, 320, { width: 100, align: 'center' });
            doc.rect(120, 310, 180, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('Lock-in Period', 120, 320, { width: 180, align: 'center' });
            doc.rect(300, 310, 480, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text(`${proposal.LockIn} months`, 300, 320, { width: 480, align: 'center' });
            doc.rect(20, 340, 100, 30).fillAndStroke('white', 'black').fillColor('black').text('4', 20, 350, { width: 100, align: 'center' });
            doc.rect(120, 340, 180, 30).fillAndStroke('white', 'black').fillColor('black').text('Notice Period (post lock-in)', 120, 350, { width: 180, align: 'center' });
            doc.rect(300, 340, 480, 30).fillAndStroke('white', 'black').fillColor('black').text('6 months', 300, 350, { width: 480, align: 'center' });
            doc.rect(20, 370, 100, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('5', 20, 380, { width: 100, align: 'center' });
            doc.rect(120, 370, 180, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('Escalation (Per annum)', 120, 380, { width: 180, align: 'center' });
            doc.rect(300, 370, 480, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('6% p.a - post completion of 12 months', 300, 380, { width: 480, align: 'center' });
            doc.rect(20, 400, 100, 30).fillAndStroke('white', 'black').fillColor('black').text('6', 20, 410, { width: 100, align: 'center' });
            doc.rect(120, 400, 180, 30).fillAndStroke('white', 'black').fillColor('black').text('Interest-free Service Retainer', 120, 410, { width: 180, align: 'center' });
            doc.rect(300, 400, 480, 30).fillAndStroke('white', 'black').fillColor('black').text('6 months', 300, 410, { width: 480, align: 'center' });
            doc.rect(20, 430, 100, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('7', 20, 440, { width: 100, align: 'center' });
            doc.rect(120, 430, 180, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('Car Parking Charges', 120, 440, { width: 180, align: 'center' });
            doc.rect(300, 430, 480, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('INR 12000 + taxes per ws/ per month', 300, 440, { width: 480, align: 'center' });
            doc.rect(20, 460, 100, 30).fillAndStroke('white', 'black').fillColor('black').text('8', 20, 470, { width: 100, align: 'center' });
            doc.rect(120, 460, 180, 30).fillAndStroke('white', 'black').fillColor('black').text('Cost Per Seat', 120, 470, { width: 180, align: 'center' });
            doc.rect(300, 460, 480, 30).fillAndStroke('white', 'black').fillColor('black').text('INR 19500 + taxes per month', 300, 470, { width: 480, align: 'center' });
            doc.rect(20, 490, 100, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('9', 20, 500, { width: 100, align: 'center' });
            doc.rect(120, 490, 180, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text('Billable Seats', 120, 500, { width: 180, align: 'center' });
            doc.rect(300, 490, 480, 30).fillAndStroke('#dbdbdb', 'black').fillColor('black').text(`Approx ${proposal.totalNoOfSeatsSelected}ws`, 300, 500, { width: 480, align: 'center' });
            doc.rect(20, 520, 100, 30).fillAndStroke('#999999', 'black').fillColor('black').text('10', 20, 530, { width: 100, align: 'center' });
            doc.rect(120, 520, 180, 30).fillAndStroke('#999999', 'black').fillColor('black').text('Total Monthly Cost (+GST)', 120, 530, { width: 180, align: 'center' });
            doc.rect(300, 520, 480, 30).fillAndStroke('#999999', 'black').fillColor('black').text(`INR ${new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(proposal.totalNoOfSeatsSelected * 19500)} + taxes per month`, 300, 530, { width: 480, align: 'center' });
            doc.addPage();

            // Page Six Started ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            doc.image('./assets/proposal/image/proposal-layout__page6.png', 0, 0, { width: 800, height: 566 });
            doc.addPage();

            // Page Seven Started ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            doc.image('./assets/proposal/image/proposal-layout__page7.png', 0, 0, { width: 800, height: 566 });
            doc.addPage();

            // Page Eight Started ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            doc.image('./assets/proposal/image/proposal-layout__page8.png', 0, 0, { width: 800, height: 566 });
            doc.addPage();

            // Page Nine Started ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            doc.image('./assets/proposal/image/proposal-layout__page9.png', 0, 0, { width: 800, height: 566 });

            // PDF generation Ends Here ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            doc.end();

            Proposal.updateOne({ _id: Id }, { $set: { status: 'Completed But not Esclated', selectFrom: selectFrom } }).then((updateResult) => {
                if (updateResult.acknowledged && updateResult.modifiedCount > 0) {
                    LogController.proposal.update(proposal._id, { logMessage: 'Proposal Generated', proposalGenerated: 'yes' }).then(() => {
                        res.status(200).send({
                            "Message": 'Proposal Generated Successfully'
                        });
                        next();
                    }).catch((err) => {
                        if (!err.message) err.message = 'Something went wrong';
                        if (!err.status) err.status = 500;
                        return next(err);
                    })
                }
            }).catch((err) => {
                if (!err.message) err.message = 'Something went wrong';
                if (!err.status) err.status = 500;
                return next(err);
            })

            

            
        }
        catch (err) {
            if (!err.status) err.status = 500;
            if (!err.message) err.message = 'Server Error';
            throw err;
        }
    }).catch((err) => {
        if (!err.message) err.message = 'Error while Generating proposal';
        next(err);
    })




}

const sendProposalByEmail = (req, res, next) => {
    let data = req.body;
    let Id = req.params.Id;

    const transporter = nodemailer.createTransport({
        service: process.env.NODEMAILER_SERVICE,
        auth: {
            user: process.env.NODEMAILER_AUTH_USER,
            pass: process.env.NODEMAILER_AUTH_PASSWORD
        }
    });

    let mailOptions = {
        from: process.env.NODEMAILER_AUTH_USER,
        to: req.user.userName,
        subject: 'Proposal Document From Redbrick Office',
        text: 'Dear Sir/ma\'am, \n\n We are sending you the Document related to your proposal and location. All the documents attached to this email are computer generated the are not Fixed. Please contact relavent sales person if you have and query related you proposal\n \n Thanks and regards, \n Redbricks Office',
        attachments: [
            {
                filename: 'Proposal.pdf',
                path: path.join('assets', 'proposal', 'generated', `${Id}.pdf`)
            },
            {
                filename: 'Standard_Offerings_Fitout_2022.pdf',
                path: path.join('assets', 'proposal', 'pdf', 'Standard_Offerings_Fitout_2022.pdf')
            }
        ]
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) return;
        ProposalLog.updateOne(Id, { logMessage: "Proposal Send on Email" });
    })
}

module.exports = {
    generateProposal: generateProposal,
    generateProposalPDF: generateProposalPDF,
    sendProposalByEmail: sendProposalByEmail
};