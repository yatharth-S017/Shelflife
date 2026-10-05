"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
let mongoMemoryServer = null;
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shelflife';
        const useMemory = process.env.USE_MEMORY_DB === 'true';
        if (useMemory) {
            console.log('⚡ Initializing MongoMemoryServer for zero-config environment...');
            mongoMemoryServer = await mongodb_memory_server_1.MongoMemoryServer.create();
            const uri = mongoMemoryServer.getUri();
            await mongoose_1.default.connect(uri);
            console.log(`✅ Connected to In-Memory MongoDB at ${uri}`);
        }
        else {
            await mongoose_1.default.connect(mongoUri);
            console.log(`✅ Connected to MongoDB at ${mongoUri}`);
        }
    }
    catch (error) {
        console.warn('⚠️ Standard MongoDB connection failed. Falling back to In-Memory MongoDB Server...');
        try {
            mongoMemoryServer = await mongodb_memory_server_1.MongoMemoryServer.create();
            const uri = mongoMemoryServer.getUri();
            await mongoose_1.default.connect(uri);
            console.log(`✅ Connected to Fallback In-Memory MongoDB at ${uri}`);
        }
        catch (fallbackError) {
            console.error('❌ Failed to connect to MongoDB:', fallbackError);
            process.exit(1);
        }
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    await mongoose_1.default.disconnect();
    if (mongoMemoryServer) {
        await mongoMemoryServer.stop();
    }
};
exports.disconnectDB = disconnectDB;
