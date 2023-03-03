const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const selectionDataSchema = new Schema({
    sizeOfSeat: {
        width: Number,
        height: Number
    },
    startingXAxis: Number,
    startingXAxisOpposite: Number,
    startingYAxis: Number,
    lastYAxis: Number,
    selectedAreaXAxis: Number,
    selectedAreaXAxisOpposite: Number,
    selectedAreaYAxis: Number,
    totalNoOfSeats: Number,
    AvailableNoOfSeats: Number,
    partition: [
        {
            startingPosition: Number,
            startingPositionOpposite: Number,
            width: Number,
            height: Number
        }
    ],
    gapPosition: [
        {
            pillar: Boolean,
            startingPositon: Number,
            startingPositonOpposite: Number,
            pillarWidth: Number,
            pillarHeight: Number
        }
    ],
    pillarPosition: [
        {
            startingXPosition: Number,
            startingXPositionOpposite: Number,
            startingYPosition: Number,
            pillarWidth: Number,
            pillarHeight: Number
        }
    ],
    subWorkStationArea: [
        {
            totalNoOfSeats: Number,
            AvailableNoOfSeats: Number,
            sizeOfSeat: {
                width: Number,
                height: Number
            },
            startingXAxis: Number,
            startingYAxis: Number,
            lastYAxis: Number,
            selectedAreaXAxis: Number,
            selectedAreaYAxis: Number,
            selectedAreaXAxisOpposite: Number,
            startingXAxisOpposite: Number,
            Partition: [
                {
                    startingPosition: Number,
                    startingPositionOpposite: Number,
                    width: Number,
                    height: Number
                }
            ],
            gapPosition: [
                {
                    pillar: Boolean,
                    startingPositon: Number,
                    startingPositonOpposite: Number,
                    pillarWidth: Number,
                    pillarHeight: Number
                }
            ],
            pillarPosition: [
                {
                    startingXPosition: Number,
                    startingXPositionOpposite: Number,
                    startingYPosition: Number,
                    pillarWidth: Number,
                    pillarHeight: Number
                }
            ]

        }
    ]
})

const selectionData = mongoose.model('selectionData', selectionDataSchema);

module.exports = selectionData; 