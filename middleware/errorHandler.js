const HTTP_STATUS = require('../constants/httpStatusCodes');

// 404 for routes that don't match any handler
const notFound = (req, res, next) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Centralized error handler - every controller's catch(err) should call next(err)
const errorHandler = (err, req, res, next) => {
    console.error(err);

    // Invalid MongoDB ObjectId (e.g. GET /jobs/not-a-valid-id)
    if (err.name === 'CastError') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: "false", message: `Invalid ${err.path}: ${err.value}` });
    }

    // Mongoose schema validation errors
    if (err.name === 'ValidationError') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: "false", message: err.message });
    }

    // Malformed JSON body (express.json())
    if (err.type === 'entity.parse.failed') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: "false", message: "Malformed JSON in request body" });
    }

    res.status(err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: "false",
        message: err.statusCode ? err.message : "Internal server error"
    });
};

module.exports = { notFound, errorHandler };
