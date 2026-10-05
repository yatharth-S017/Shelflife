"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const seeder_1 = require("./seed/seeder");
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        await (0, seeder_1.seedDatabase)();
        app_1.default.listen(PORT, () => {
            console.log(`🚀 ShelfLife API Server running on http://localhost:${PORT}`);
            console.log(`📚 Health check available at http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
