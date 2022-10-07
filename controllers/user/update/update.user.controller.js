const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require("../../../models/user/user.model");
const fs = require('fs');
const path = require('path');

const updateUser = (req, res, next) => {
    try {
        let data = req.body;
        let file = req.file;
        if (!data.userImage) {
            if (file) {
                data.userImage = file.path;
            }
            else {
                let error = new Error('Please upload a file');
                error.status = 422;
                throw error;
            }
        }
        if (data.password) {
            bcrypt.hash(data.password, 10, async (err, encrypted) => {
                try {
                    if (err) {
                        err.message = 'Something went wrong while hashing the password';
                        throw err;
                    }
                    else {
                        data.password = encrypted;
                    }
                }
                catch (err) {
                    if (!err.status) err.status = 400;
                    next(err);
                }
            })
        };
        User.findById(mongoose.Types.ObjectId(data._id)).then((user) => {
            if (file) {
                fs.unlinkSync(user.userImage);
            }
            User.updateOne({ _id: mongoose.Types.ObjectId(user._id) }, { $set: data }).then((result) => {
                if (result.modifiedCount > 0) {
                    res.status(202).send({
                        "Message": "User Updated Successfully!"
                    })
                } else {
                    let error = new Error('Error while updating User');
                    error.status = 400;
                    throw error;
                }
            }).catch((err) => {
                if (!err.message) err.message = 'Something went wrong while updating user!';
                if (!err.status) err.status = 400;
                next(err);
            })
        }).catch((err) => {
            if (!err.message) err.message = 'Something went wrong while updating User!';
            if (!err.status) err.status = 400;
            next(err);
        });
    }
    catch (err) {
        if (!err.status) err.status = 503;
        next(err);
    }
}




module.exports = updateUser;