const mongoose = require('mongoose');

const databaseConnection = () => {
    // return mongoose.connect('mongodb://localhost:27017/Redbricks');
    return mongoose.connect(process.env.MONGODB_URI);
}

module.exports = databaseConnection;