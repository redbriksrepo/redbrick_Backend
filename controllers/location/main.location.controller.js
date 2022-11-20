const getCentersInLocation = require("./centersInLocation/centersInLocation.loation.controller");
const createLocation = require("./create/create.location.controller");
const getAllLocation = require("./getAll/getAll.location.controller");
const getLocationById = require("./getById/getById.location.controller");
const getLocationList = require("./location-list/location-list.location.controller");


const locationController = {
    create: createLocation,
    getAll: getAllLocation,
    getById: getLocationById,
    getLoctionList: getLocationList,
    getCentesInLocation: getCentersInLocation
}

module.exports = locationController;