const Location = require("../../../models/location/location.model");
// const JsonData = require("../../../models/jsonData/jsonData.model")
const fs = require('fs')
const createLocation = async (req,res,next) => {
    try {
        let data = req.body;
        // console.log('Location added=>>',data)
        // let jsonFile = req.files['jsonFile'][0];
        let layoutImage = req.files['layoutImage'][0];
        // let centerImage = req.files['centerImage'];
        // if (!jsonFile && !layoutImage) {
            if (!layoutImage) {
            let error = new Error('Please upload layout Image');
            error.status = 400;
            throw error;
        }
        else {

            if (layoutImage) data.layoutImage = layoutImage.path;
            // if(centerImage) data.centerImage = centerImage.path;

            if (data.imageLinks === '{}') {
                delete data.imageLinks;
            }
            else {
                data.imageLinks = Object.values(JSON.parse(data.imageLinks));
            }
            if(data.rentSheet === '{}'){
                delete data.rentSheet;
            }
            else{
                data.rentSheet = Object.values(JSON.parse(data.rentSheet));
            }
            Location.findOne().where('location').equals(data.location).where('center').equals(data.center).where('floor').equals(data.floor).then((result) => {
                if (result) {
                    let error = new Error('Location Already Exists');
                    error.status = 400;
                    throw error;
                }
                else {
                    let location = new Location(data);
                    location.save().then((result) => {
                        if (!result) {
                            let error = new Error('Error while adding location');
                            error.status = 401;
                            throw error;
                        }
                        else {
                            // fs.readFile(jsonFile.path, "utf8", (err, fileData) => {
                            //     if (err) {
                            //       console.error("Error reading the JSON file:", err);
                            //       return;
                            //     }
                    
                            //     try {
                            //       // Parse the JSON data to a JavaScript object
                            //       const jsonData = JSON.parse(fileData);
                            //       jsonData.imageFile = layoutImage.path;
                            //     //   console.log(layoutImage.path, "FILEPATH");
                            //       // Create a new instance of the jsonData model
                            //       const jsonDataObj = new JsonData(jsonData);
                    
                            //       // Save the jsonData instance to the database
                            //       jsonDataObj.save().then((jsonResult) => {
                            //     Location.updateOne({location:data.location,center:data.center,floor:data.floor }, { $set:{jsonData:jsonResult._id}}).then((result) => {
                            //         console.log(result,'Complete JSON REFERNVE')
                            //         })
                                    
                            //         if (!jsonResult) {
                            //           let error = new Error("Error while adding JSON data");
                            //           error.status = 401;
                            //           throw error;
                            //         } else {
                            //         //   console.log("JSON Data Added Successfully");
                            //         }
                            //       }).catch((err) => {
                            //         if (!err.message) err.message = "Error while adding JSON data";
                            //         if (!err.status) err.status = 503;
                            //         next(err);
                            //       });
                            //     } catch (error) {
                            //       console.error("Error parsing JSON:", error);
                            //     }
                            //   });
                    
                            res.status(202).send({
                                "data": result,
                                "Message": "Location added Successfully"
                            })
                        }
                    }).catch((err) => {
                        if (!err.message) err.message = 'Error while adding location';
                        if (!err.status) err.status = 503;
                        next(err);
                    })
                }
            }).catch((err) => {
                if (!err.message) err.message = 'Error while adding location';
                if (!err.status) err.status = 503;
                next(err);
            })
        }
    }
    catch (err) {
        if (!err.message) err.message = 'Error while adding location';
        throw err;
    }
}

module.exports = createLocation;