const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require("../../../models/user/user.model");

const UpdateUserWithGivenData = (data,next) => {
    User.updateOne({ _id: mongoose.Types.ObjectId(data._id) }, { $set: data }).then((result) => {
        console.log(result);
        if (result.acknowledged === true) {
            if (result.modifiedCount > 0) {
                res.status(202).send({
                    "Message": "User Updated Successfully!"
                })
            }
            else {
                let error = new Error('Error while updating user');
                error.status = 400;
                throw error;
            }
        }
        else {
            let error = new Error('Something went wrong while updating user');
            error.status = 400;
            throw error;
        }
    }).catch((err) => {
        if (!err.message) err.message = 'Something went wrong while updating user!';
        if (!err.status) err.status = 400;
        next(err);
    })
}

const updateUser = (req, res, next) => {
    let data = req.body;
    console.log(data);
    try {

        if (data.password) {
            bcrypt.hash(data.password, 10, async (err, encrypted) => {
                if (err) {
                    err.message = 'Something Went wrong while hashing the password';
                    throw err;
                }
                else {
                    data = { ...data, password: encrypted };
                    UpdateUserWithGivenData(data,next);
                }
            })
        }
        else {
            UpdateUserWithGivenData(data,next);
        }
    }
    catch (err) {
        if (!err.message) err.message = 'Error while updating User';
        if (!err.status) err.status = 400;
        throw err;
    }
}




module.exports = updateUser;