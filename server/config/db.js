const mongoose = require('mongoose');

let mongod = null;

/**
 * Sanitize connection URI to prevent exposing credentials in logs
 */
const sanitizeUri = (uri) => {
  if (!uri) return '';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1******$3');
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume_ai';

  try {
    // Attempt connecting to the configured URI with a 3-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to MongoDB at: ${sanitizeUri(uri)}`);
  } catch (error) {
    console.warn(`[Database] Could not connect to external MongoDB: ${error.message}`);
    console.log('[Database] Starting built-in in-memory MongoDB server for seamless zero-config operation...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to In-Memory MongoDB at: ${sanitizeUri(memoryUri)}`);
    } catch (memErr) {
      console.error('[Database] Failed to launch in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }

  // Graceful connection event listeners
  mongoose.connection.on('error', (err) => {
    console.error('[Database Error]:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] Disconnected from MongoDB.');
  });
};

const closeDB = async () => {
  await mongoose.connection.close();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, closeDB };
