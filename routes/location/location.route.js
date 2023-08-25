const locationController = require('../../controllers/location/main.location.controller');

const locationRoute = require('express').Router();
const multer = require('multer');
const path = require('path');
const middleware = require('../../middlewares/main.middlewares');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // if (file.mimetype === 'application/json') {
        //     cb(null, path.join('assets','layout','json'));
        // }
         if (file.mimetype === 'image/png') {
            cb(null, path.join('assets','layout','image'));
        };
        // console.log(req.body.location,req.body.center,req.body.floor,file.mimetype)\
    },
    filename: (req, file, cb) => {
        cb(null, `${req.body.location}_${req.body.center}_${req.body.floor}.${file.mimetype.split('/')[1]}`);
    }
    
});

const fileFilter = (req, file, cb) => {
    // if (file.mimetype === 'application/json' || file.mimetype === 'image/png') {
        if (file.mimetype === 'image/png') {
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

locationRoute.post('/create',middleware.checkAdminAuthorization, multer({ storage: fileStorage, fileFilter: fileFilter}).fields([{name: 'layoutImage', maxCount: 1}]), locationController.create);

locationRoute.post('/update/:Id', middleware.checkAdminAuthorization, multer({ storage: fileStorage, fileFilter: fileFilter }).fields([{ name: 'layoutImage', maxCount: 1 }]), locationController.update);

locationRoute.delete('/delete/:Id', middleware.checkAdminAuthorization, locationController.delete);

locationRoute.get('/getAll', locationController.getAll);

locationRoute.get('/getById/:Id', locationController.getById);

locationRoute.get('/getLocationList',locationController.getLoctionList);

locationRoute.get('/getCentersInLocation/:location',locationController.getCentesInLocation);

locationRoute.post('/getRentSheet',locationController.getRentSheet);

locationRoute.post('/updateRackValue',locationController.updateRackValue);

locationRoute.get('/getImage/:Id',locationController.getImage);

locationRoute.get('/getFloorsInLocation/:floor', locationController.getFloorsInCenter)

locationRoute.post('/addLayout/:Id',locationController.addLayout);

locationRoute.get('/getBorderData/:Id',locationController.getBorder);
module.exports = locationRoute;