"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const routes_1 = __importDefault(require("./routes"));
const logger_middleware_1 = require("./middleware/logger.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logger_middleware_1.requestLogger);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        service: 'ShelfLife Library Management API',
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use('/api', routes_1.default);
// Static frontend serving if frontend/dist exists
const frontendDistPath = path_1.default.join(__dirname, '../../frontend/dist');
if (fs_1.default.existsSync(frontendDistPath)) {
    console.log(`📁 Serving static production frontend from ${frontendDistPath}`);
    app.use(express_1.default.static(frontendDistPath));
    // SPA fallback for non-API routes
    app.use((req, res, next) => {
        if (req.method === 'GET' && !req.originalUrl.startsWith('/api')) {
            return res.sendFile(path_1.default.join(frontendDistPath, 'index.html'));
        }
        next();
    });
}
// 404 Route Handler for unmatched API routes or missing static files
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: `Route not found: ${req.method} ${req.originalUrl}`,
            statusCode: 404,
        },
    });
});
// Centralized Error Handling Middleware
app.use(error_middleware_1.errorHandler);
exports.default = app;
