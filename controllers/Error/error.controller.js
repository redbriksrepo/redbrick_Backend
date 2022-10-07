
const errorHandler = (error, req, res, next) => {
    let status = error.status || 500;
    let message = error.message;
    res.status(status).json({ "Message": message });
}

module.exports = errorHandler;