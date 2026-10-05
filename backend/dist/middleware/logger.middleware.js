"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const requestLogger = (req, res, next) => {
    const start = Date.now();
    const { method, originalUrl, ip } = req;
    const timestamp = new Date().toISOString();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;
        const statusEmoji = statusCode >= 400 ? '❌' : '✅';
        console.log(`[${timestamp}] ${statusEmoji} ${method} ${originalUrl} ${statusCode} - ${duration}ms (IP: ${ip})`);
    });
    next();
};
exports.requestLogger = requestLogger;
