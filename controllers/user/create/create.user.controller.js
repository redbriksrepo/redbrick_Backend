const User = require("../../../models/user/user.model");
const bcrypt = require('bcrypt');

const createUser = (req,res,next) => {
    let data = req.body;
    let file = req.file;
    try{
        if(!file) {
            let error = new Error('Please Upload a profile Picture');
            error.status = 422;
            throw error;
        }
        User.findOne({'userName': data.userName }).then((user) => {
            if(user){
                let error = new Error('User Already Exist with given Username!');
                error.status = 406;
                throw error;
            }
            else {
                bcrypt.hash(data.password,10,async (err,encrypted) => {
                    try{
                        if(err) {
                            err.message = 'Something went wrong while hashing the password!';
                            if(!err.status) err.status = 503;
                            throw err;
                        }
                        if (file) data.userImage = file.path;
                        data.password = encrypted;
                        let user = new User(data);
                        user.save().then((user) => {
                            if(user) {
                                res.status(202).send({
                                    "Message": "User Added Successfully",
                                    "User": user
                                })
                            }
                            else{
                                let error = new Error('Error while creating user');
                                error.status = 500;
                                throw error;
                            }
                        }).catch((err) => {
                            if(!err.status) {
                                err.status = 400;
                            }
                            next(err);
                        })
                    }
                    catch (err) {
                        if(!err.status) err.status = 400;
                        next(err);
                    }
                })
            }
        }).catch((err) => {
            if(!err.status) {
                err.status = 400;
            }
            next(err);
        })
    }
    catch (err) {
        if(!err.status) {
            err.status = 400;
        }
        throw err;
    }
}



module.exports = createUser;