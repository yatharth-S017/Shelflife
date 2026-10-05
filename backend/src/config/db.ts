import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shelflife';
    const useMemory = process.env.USE_MEMORY_DB === 'true';

    if (useMemory) {
      console.log('⚡ Initializing MongoMemoryServer for zero-config environment...');
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      await mongoose.connect(uri);
      console.log(`✅ Connected to In-Memory MongoDB at ${uri}`);
    } else {
      await mongoose.connect(mongoUri);
      console.log(`✅ Connected to MongoDB at ${mongoUri}`);
    }
  } catch (error) {
    console.warn('⚠️ Standard MongoDB connection failed. Falling back to In-Memory MongoDB Server...');
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      await mongoose.connect(uri);
      console.log(`✅ Connected to Fallback In-Memory MongoDB at ${uri}`);
    } catch (fallbackError) {
      console.error('❌ Failed to connect to MongoDB:', fallbackError);
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
