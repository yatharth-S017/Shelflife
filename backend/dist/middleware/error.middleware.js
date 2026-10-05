"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    // Handle Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        message = `Duplicate value entered for unique field: ${field}`;
    }
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const messages = Object.values(err.errors).map((e) => e.message);
        message = `Validation Error: ${messages.join(', ')}`;
    }
    // Handle CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Resource not found with ID: ${err.value}`;
    }
    console.error(`[ERROR] ${req.method} ${req.originalUrl} - ${statusCode} - ${message}`);
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            statusCode,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        },
    });
};
exports.errorHandler = errorHandler;
