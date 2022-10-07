const authentication = require('./Authentication/authentication.middlewares');


const middleware = {
    authentication: authentication
}

module.exports = middleware;