const getCentersInLocation = require("./centersInLocation/centersInLocation.loation.controller");
const createLocation = require("./create/create.location.controller");
const deleteLocationData = require("./delete/delete.location.controller");
const getAllLocation = require("./getAll/getAll.location.controller");
const getLocationById = require("./getById/getById.location.controller");
const getRent = require("./getRent/getRent.location.controller");
const getLocationList = require("./location-list/location-list.location.controller");
const updateLocationData = require("./update/update.location.controller");


const locationController = {
    create: createLocation,
    getAll: getAllLocation,
    getById: getLocationById,
    getLoctionList: getLocationList,
    getCentesInLocation: getCentersInLocation,
    delete: deleteLocationData,
    update: updateLocationData,
    getRentSheet:getRent
}

module.exports = locationController;