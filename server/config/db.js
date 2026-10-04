import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Configure reliable DNS servers for Windows SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('[DNS Configuration Warning]', dnsErr.message);
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rideflow';


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

  try {
    console.log(`[MongoDB] Attempting connection to: ${safeURI}...`);
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 12000,
      connectTimeoutMS: 12000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = !!conn.connections[0].readyState;
    console.log(`[MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB Atlas (${safeURI}). Error: ${error.message}`);
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

