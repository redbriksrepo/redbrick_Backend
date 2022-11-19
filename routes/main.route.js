const middleware = require('../middlewares/main.middlewares');
const authRoute = require('./auth/auth.route');
const locationRoute = require('./location/location.route');
const logsRoute = require('./logs/logs.route');
const profileRoute = require('./profile/profile.route');
const proposalRoute = require('./proposal/proposal.route');
const userRoute = require('./user/user.route');

const mainRoute = require('express').Router();

mainRoute.use('/auth', authRoute);

mainRoute.use('/user', middleware.authentication, userRoute);

mainRoute.use('/proposal', proposalRoute);

mainRoute.use('/location',middleware.authentication, locationRoute);

mainRoute.use('/profile', middleware.authentication, profileRoute);

mainRoute.use('/logs', logsRoute);


module.exports = mainRoute;