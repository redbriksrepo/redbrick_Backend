const locationController = require('../../controllers/location/main.location.controller');

const locationRoute = require('express').Router();
const multer = require('multer');
const path = require('path');
const middleware = require('../../middlewares/main.middlewares');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype === 'application/json') {
            cb(null, path.join('assets','layout','json'));
        }
        else if (file.mimetype === 'image/png') {
            cb(null, path.join('assets','layout','image'));
        };
    },
    filename: (req, file, cb) => {
        cb(null, `${req.body.location}_${req.body.center}.${file.mimetype.split('/')[1]}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/json' || file.mimetype === 'image/png') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}

// const layoutImageFileFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/png') {
//         cb(null, true);
//     }
//     cb(null, false);
// }

locationRoute.post('/create',middleware.checkAdminAuthorization, multer({ storage: fileStorage, fileFilter: fileFilter}).fields([{ name: 'jsonFile', maxCount: 1 },{name: 'layoutImage', maxCount: 1}]), locationController.create);

locationRoute.post('/update/:Id', middleware.checkAdminAuthorization, multer({ storage: fileStorage, fileFilter: fileFilter }).fields([{ name: 'jsonFile', maxCount: 1 }, { name: 'layoutImage', maxCount: 1 }]), locationController.update);

locationRoute.delete('/delete/:Id', middleware.checkAdminAuthorization, locationController.delete);

locationRoute.get('/getAll', locationController.getAll);

locationRoute.get('/getById/:Id', locationController.getById);

locationRoute.get('/getLocationList',locationController.getLoctionList);

locationRoute.get('/getCentersInLocation/:location',locationController.getCentesInLocation);

locationRoute.post('/getRentSheet',locationController.getRentSheet);

module.exports = locationRoute;