const User = require("../../models/user/user.model");
const jwt = require('jsonwebtoken');

const logout = (req,res,next) => {
    try {
        let token = req.headers?.['auth-token'];

        // checking if Auth - token is provided in header or not
        if (!token) {
            let error = new Error('Authentication header not provided!');
            error.status = 406;
            throw error;
        }

        let decode = jwt.verify(token, process.env.AUTH_TOKEN_SECRET);
        // let decode = jwt.verify(token, 'sdfkajsdfwf384*&^*^');
        if(decode){
            User.updateOne({'userName': decode.userName},{$set: {'userActive': false,'activeDevice': 'None'}}).then((data) => {
                if(data.modifiedCount > 0) {
                    res.status(202).send({
                        "Message": "user logout sucessfully!"
                    })
                }
                else{
                    let error = new Error('Error during logout');
                    error.status = 500;
                    throw error;
                }
            }).catch((err) => {
                if (!err.status) err.status = 503;
                if (!err.message) err.message = 'Error while loggig out!';
                next(err);
            })
        }
        else {
            let error = new Error('Error during Authentication!');
            error.status = 406;
            throw error;
        }
    }
    catch (err) {
        if (!err.message) err.message = 'Error while logging out!';
        if (!err.status) err.status = 400;
        throw err;
    }
}

const logoutController = {
    logout: logout
};

module.exports = logoutController;