const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const seedDatabase = require('./utils/seed');

const startServer = async () => {
  try {
    console.log('--- Initializing WEbook Backend API ---');
    await connectDB();
    await seedDatabase();

    const server = app.listen(env.PORT, () => {
      console.log(`WEbook REST Server running in [${env.NODE_ENV}] mode on http://localhost:${env.PORT}`);
    });

    // Graceful shutdown handling
    const shutdown = async () => {
      console.log('Shutting down server gracefully...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Fatal Server Startup Error:', error);
    process.exit(1);
  }
};

startServer();
