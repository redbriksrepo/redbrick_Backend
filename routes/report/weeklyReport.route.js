const reportController = require('../../controllers/weekly report/main.report.controller');


const reportRoute = require('express').Router();

reportRoute.post('/generateReport', reportController.getReport);


module.exports = reportRoute;