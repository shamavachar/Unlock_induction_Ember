const errorHandler = (err, req, res, next) => {
    console.error("❌ Error:", err.stack || err.message);

    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || "Internal Server Error";

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
    }

    if (err.name === "CastError" && err.kind === "ObjectId") {
        statusCode = 404;
        message = `Resource not found with id ${err.value}`;
    }

    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate value entered for '${field}' field. Must be unique.`;
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
};

module.exports = errorHandler;
