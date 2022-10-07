const User = require("../../../models/user/user.model");

const getAllUser = (req, res, next) => {
    try {
        User.find().then((allUser) => {
            if (allUser) {
                res.status(200).send(allUser);
            }
            else {
                let error = new Error('Something went wrong while getting all users');
                throw error;
            }
        }).catch((err) => {
            if (!err.status) {
                err.status = 400;
            }
            next(err);
        })
    }
    catch (err) {
        if (!err.status) {
            err.status = 400;
        }
        throw err;
    }
}

module.exports = getAllUser;