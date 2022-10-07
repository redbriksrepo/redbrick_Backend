const locationRoute = require('express').Router();

locationRoute.post('/create');

locationRoute.post('/update');

locationRoute.post('/delete');

locationRoute.get('/getAll');

locationRoute.get('/getById');

module.exports = locationRoute;