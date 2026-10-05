import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, getDBStatus } from './config/db.js';
import authRoutes, { seedUsers } from './routes/auth.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import moderationRoutes from './routes/moderation.routes.js';
import fleetRoutes, { seedVehicles } from './routes/fleet.routes.js';
import routeRoutes from './routes/route.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    status: 'online',
    service: 'RideFlow Backend Server',
    database: dbStatus.connected ? 'MongoDB (Connected)' : 'In-Memory Hybrid / Fallback',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/auth/login',
      '/api/auth/register',
      '/api/bookings/create',
      '/api/moderation/strike',
      '/api/moderation/appeal',
      '/api/fleet/vehicles',
      '/api/route/distance'
    ]
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/route', routeRoutes);

// Serve static frontend build from dist in production
app.use(express.static(distPath));

// For SPA client-side routing, fallback to index.html for non-API GET requests
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Start Server and connect to MongoDB
const startServer = async () => {
  try {
    const isMongoConnected = await connectDB();
    await seedUsers();
    await seedVehicles();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 RideFlow Backend Express Server running on http://localhost:${PORT}`);
      console.log(`📡 Database status: ${isMongoConnected ? 'Connected to MongoDB Atlas' : 'Running with Persistent Local DB'}`);
    });
  } catch (error) {
    console.error('Failed to start RideFlow server:', error);
  }
};

startServer();
