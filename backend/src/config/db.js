const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const env = require('./env');

let mongoServer = null;

const connectDB = async () => {
  try {
    let uri = env.MONGO_URI;

    if (!uri) {
      console.log('No external MONGO_URI provided. Initializing embedded MongoDB server...');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log(`Embedded MongoDB instance active at: ${uri}`);
    } else {
      console.log(`Connecting to external MongoDB at: ${uri}...`);
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`Direct connection failed (${error.message}). Falling back to embedded MongoDB...`);
    try {
      mongoServer = await MongoMemoryServer.create();
      const fallbackUri = mongoServer.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log(`Embedded MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (fallbackError) {
      console.error(`Fatal MongoDB connection error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
