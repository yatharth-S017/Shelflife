import app from './app';
import { connectDB } from './config/db';
import { seedDatabase } from './seed/seeder';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 ShelfLife API Server running on http://localhost:${PORT}`);
      console.log(`📚 Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
