const middleware = require('../middlewares/main.middlewares');
const authRoute = require('./auth/auth.route');
const locationRoute = require('./location/location.route');
const logsRoute = require('./logs/logs.route');
const profileRoute = require('./profile/profile.route');
const proposalRoute = require('./proposal/proposal.route');
const testRoute = require('./test/test.router');
const userRoute = require('./user/user.route');

const mainRoute = require('express').Router();

mainRoute.use('/auth', authRoute);

mainRoute.use('/user', middleware.authentication, userRoute);

mainRoute.use('/proposal', proposalRoute);

mainRoute.use('/location', locationRoute);

mainRoute.use('/profile', middleware.authentication, profileRoute);

mainRoute.use('/logs',middleware.authentication, logsRoute);

mainRoute.use('/test', testRoute);


module.exports = mainRoute;