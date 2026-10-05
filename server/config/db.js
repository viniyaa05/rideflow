import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Direct verified replica set seed list (bypasses SRV lookup issues on restricted networks)
const DIRECT_REPLICA_URI = 'mongodb://kaviniyaa05_db_user:kavi123456@ac-caxcvf8-shard-00-00.x6rov7b.mongodb.net:27017,ac-caxcvf8-shard-00-01.x6rov7b.mongodb.net:27017,ac-caxcvf8-shard-00-02.x6rov7b.mongodb.net:27017/rideflow?tls=true&authSource=admin&retryWrites=true&w=majority';

const MONGODB_URI = process.env.MONGODB_URI || DIRECT_REPLICA_URI;

let isConnected = false;

// Safe URI string for logging (hiding password)
const safeURI = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');

mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log(`[MongoDB Atlas] Successfully connected to database: ${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB Error]:`, err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Atlas] Disconnected from database.');
  isConnected = false;
});

export const connectDB = async () => {
  if (isConnected) {
    return true;
  }

  // Attempt 1: Try configured URI
  try {
    console.log(`[MongoDB] Connecting to MongoDB Atlas: ${safeURI}...`);
    const conn = await mongoose.connect(MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = !!conn.connections[0].readyState;
    console.log(`[MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Warning] Primary connection attempt failed: ${error.message}`);
    
    // Attempt 2: If primary was SRV or failed, try direct replica set URI
    if (MONGODB_URI !== DIRECT_REPLICA_URI) {
      try {
        console.log(`[MongoDB] Attempting fallback to direct replica set seed list...`);
        const fallbackConn = await mongoose.connect(DIRECT_REPLICA_URI, {
          family: 4,
          serverSelectionTimeoutMS: 10000,
          connectTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        });
        isConnected = !!fallbackConn.connections[0].readyState;
        console.log(`[MongoDB Atlas] Connected successfully via direct replica set to host: ${fallbackConn.connection.host}`);
        return true;
      } catch (fbErr) {
        console.warn(`[MongoDB Warning] Direct replica set fallback failed: ${fbErr.message}`);
      }
    }

    console.log('[MongoDB] Running in In-Memory / Hybrid Mode with resilient local persistence.');
    isConnected = false;
    return false;
  }
};

export const getDBStatus = () => ({
  connected: isConnected,
  host: isConnected ? mongoose.connection.host : 'Hybrid/In-Memory',
  dbName: isConnected ? mongoose.connection.name : 'rideflow',
  uri: safeURI
});

