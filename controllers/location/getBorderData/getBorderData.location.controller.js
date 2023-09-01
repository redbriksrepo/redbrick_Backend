const { default: mongoose } = require("mongoose");
const Location = require("../../../models/location/location.model");

const getBorderDataById = (req, res, next) => {
    try {
        const Id = req.params.Id;
        if (!Id) {
            const error = new Error('Id not provided');
            error.status = 400;
            throw error;
        } else {
            if (mongoose.isValidObjectId(Id)) {
                Location.findById(mongoose.Types.ObjectId(Id))
                    .select('layoutBorder') // Select only the layoutBorder field
                    .then((location) => {
                        if (!location) {
                            console.log("No Data in layoutBorder")
                            res.status(200).send('No Data')
                        } else {
                            let data=location.layoutBorder;
                            res.status(200).send({layoutArray:data}); // Send the layoutdata field
                            // const shapeArray = [];
                            // for (const layoutBorderObj of data) {
                            //     // Iterate through each shape object in the layoutBorder object's layoutBorder array
                            //     // for (const shapeObj of layoutBorderObj.layoutBorder) {
                            //     //     shapeArray.push(JSON.parse(shapeObj.shape));
                            //     // }
                            // }
                            // if(shapeArray.length==0){
                            //     res.status(200).send({"Message":'No data'})
                            // }else{
                               
                            // }
                        }
                    }).catch((err) => {
                        if (!err.message) err.message = 'Something went wrong while getting data of selected location';
                        if (!err.status) err.status = 503;
                        next(err);
                    })
            } else {
                const error = new Error('Invalid location Id');
                error.status = 400;
                throw error;
            }
        }
    } catch (err) {
        if (!err.message) err.message = 'Error while getting Image by ID';
        if (!err.status) err.status = 503;
        throw err;
    }
}

module.exports = getBorderDataById;
