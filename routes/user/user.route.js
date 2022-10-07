const userController = require('../../controllers/user/main.user.controller');
const multer = require('multer');
const path = require('path');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profileImages');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    }
    cb(null, false);
}

const userRoute = require('express').Router();

userRoute.post('/create', multer({storage: fileStorage, fileFilter: fileFilter}).single('userImage'), userController.create);

userRoute.post('/update',multer({storage: fileStorage, fileFilter: fileFilter}).single('userImage'), userController.update);

userRoute.delete('/delete/:id',userController.delete);

userRoute.get('/getAll',userController.getAll);

userRoute.get('/getById/:id',userController.getById);

module.exports = userRoute;