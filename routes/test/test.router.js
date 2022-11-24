const testRoute = require('express').Router();
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const path = require('path');

testRoute.get('/get:location/:center', (req, res, next) => {
    try {
        let location = req.params.location;
        let center = req.params.center;
        let file = path.join('layout', 'json', `${location}_${center}.json`);

        s3.getObject({ Bucket: 'cyclic-real-puce-fish-cape-ap-northeast-1', Key: file }, (err, data) => {
            if (err) throw err;
            res.attachment(file);
            res.send(data.Body);
        })

    }
    catch (err) {
        if (!err.message) err.message = 'Error while geting file';
        throw err;
    }
})

module.exports = testRoute;