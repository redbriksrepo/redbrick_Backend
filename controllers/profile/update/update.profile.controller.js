const { default: mongoose } = require("mongoose");
const User = require("../../../models/user/user.model");
const bcrypt = require('bcrypt');

const updateUserProfile = (req, res, next) => {
    try {
        let data = req.body;
        let Id = req.user._id;
        if (!Id) {
            let error = new Error('Unauthorized User');
            error.status = 401;
            throw error;
        }
        else {
            try {
                if (data.password) {
                    bcrypt.hash(data.password, 10, async (err, encrypted) => {
                        if (err) {
                            err.message = 'Something went wrong while hashing password';
                            throw err;
                        }
                        else {
                            data = { ...data, password: encrypted };
                        }
                    });
                }
            }
            catch (err) {
                if (!err.message) err.message = 'Error while updating Profile';
                if (!err.status) err.status = 400;
                throw err; 
            }
            finally {
                User.updateOne({ _id: mongoose.Types.ObjectId(Id) }, { $set: data }).then((result) => {
                    if (result.acknowledged === true) {
                        if (result.modifiedCount > 0) {
                            res.status(200).send({
                                "Message": "Profile Updated Successfully"
                            })
                        }
                        else {
                            let error = new Error('Error while updating profile');
                            error.status = 400;
                            throw error;
                        }
                    }
                    else {
                        let error = new Error('Invalid User Id');
                        error.status = 400;
                        throw error;
                    }
                }).catch((err) => {
                    if (!err.message) err.message = "Error while updating Profile";
                    if (!err.status) err.status = 400;
                    next(err);
                })
            }
        }
    }
    catch (err) {
        if (!err.message) err.message = 'Error while updating Profile';
        if (!err.status) err.status = 400;
        throw err;
    }
}

module.exports = updateUserProfile;