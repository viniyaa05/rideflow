import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoints (Express 5 compatibility)
const handleHealthCheck = (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    status: 'online',
    service: 'RideFlow Backend Server',
    database: dbStatus.connected ? 'MongoDB Atlas (Connected)' : 'In-Memory Hybrid / Fallback',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/v1/auth/login',
      '/api/v1/auth/register',
      '/api/v1/auth/me',
      '/api/v1/bookings/create',
      '/api/v1/moderation/strike',
      '/api/v1/fleet/rentals',
      '/api/v1/route/fares'
    ]
  });
};

app.get('/api/health', handleHealthCheck);
app.get('/api/v1/health', handleHealthCheck);

// Mount Routes (supporting both /api and /api/v1)
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);

app.use('/api/bookings', bookingRoutes);
app.use('/api/v1/bookings', bookingRoutes);

app.use('/api/moderation', moderationRoutes);
app.use('/api/v1/moderation', moderationRoutes);

app.use('/api/fleet', fleetRoutes);
app.use('/api/v1/fleet', fleetRoutes);

app.use('/api/route', routeRoutes);
app.use('/api/v1/route', routeRoutes);

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

// Active simulation timers map: bookingId -> interval
const activeSimulations = new Map();

// Real-Time GPS Tracking & Driver Telemetry WebSockets
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // 1. Join ride room (passenger and driver join the same room)
  socket.on('join_ride', ({ bookingId }) => {
    if (!bookingId) return;
    const room = `ride_${bookingId}`;
    socket.join(room);
    console.log(`[Socket.IO] ${socket.id} joined ride room: ${room}`);
    socket.emit('joined_ride', { room, bookingId, timestamp: Date.now() });
  });

  // 2. Driver emits live GPS coordinates
  socket.on('driver_location_update', ({ bookingId, lat, lng, speedKmH = 35, heading = 0 }) => {
    if (!bookingId || !lat || !lng) return;
    const room = `ride_${bookingId}`;
    io.to(room).emit('live_driver_pos', {
      lat,
      lng,
      speedKmH,
      heading,
      timestamp: Date.now()
    });
  });

  // 3. Driver arrival signal
  socket.on('driver_arrived_pickup', ({ bookingId }) => {
    if (!bookingId) return;
    const room = `ride_${bookingId}`;
    io.to(room).emit('driver_arrived', { bookingId, timestamp: Date.now() });
  });

  // 4. Trip status changed (OTP verified -> in_progress -> completed)
  socket.on('trip_status_changed', ({ bookingId, status }) => {
    if (!bookingId || !status) return;
    const room = `ride_${bookingId}`;
    io.to(room).emit('trip_status_changed', { bookingId, status, timestamp: Date.now() });
  });

  // 5. In-ride chat message sync across rooms
  socket.on('send_ride_message', ({ bookingId, message }) => {
    if (!bookingId || !message) return;
    const room = `ride_${bookingId}`;
    io.to(room).emit('new_ride_message', { bookingId, message, timestamp: Date.now() });
  });

  // 6. Stop route simulation
  socket.on('stop_route_simulation', ({ bookingId }) => {
    if (bookingId && activeSimulations.has(bookingId)) {
      clearInterval(activeSimulations.get(bookingId));
      activeSimulations.delete(bookingId);
      console.log(`[Socket.IO] Stopped simulation for room: ride_${bookingId}`);
      io.to(`ride_${bookingId}`).emit('simulation_stopped', { bookingId });
    }
  });

  // 7. Automated Single-Laptop Driver Route Simulator
  // Steps through realistic route waypoints and broadcasts to the passenger room
  socket.on('start_route_simulation', ({ bookingId, startCoords, targetCoords, speedMultiplier = 1 }) => {
    if (!bookingId) return;
    const room = `ride_${bookingId}`;
    console.log(`[Socket.IO] Starting automated driver simulation for room: ${room}`);

    // Clear previous if running
    if (activeSimulations.has(bookingId)) {
      clearInterval(activeSimulations.get(bookingId));
      activeSimulations.delete(bookingId);
    }

    const originLat = startCoords?.lat || 13.0720;
    const originLng = startCoords?.lng || 80.2580;
    const destLat = targetCoords?.lat || 13.0827;
    const destLng = targetCoords?.lng || 80.2707;

    const totalSteps = 24;
    let step = 0;

    const simTimer = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      const curve = Math.sin(progress * Math.PI) * 0.003;
      const currentLat = originLat + (destLat - originLat) * progress + curve;
      const currentLng = originLng + (destLng - originLng) * progress;
      const currentSpeed = step >= totalSteps ? 0 : Math.round(32 + Math.sin(step) * 10);
      const isArrived = step >= totalSteps;

      io.to(room).emit('live_driver_pos', {
        lat: currentLat,
        lng: currentLng,
        speedKmH: currentSpeed,
        progress: Math.min(100, Math.round(progress * 100)),
        step,
        totalSteps,
        isArrived,
        timestamp: Date.now()
      });

      if (isArrived) {
        clearInterval(simTimer);
        activeSimulations.delete(bookingId);
        io.to(room).emit('driver_arrived', { bookingId, message: 'Captain has arrived at your pickup spot!' });
      }
    }, Math.max(700, Math.round(1400 / speedMultiplier)));

    activeSimulations.set(bookingId, simTimer);
  });

  socket.on('disconnect', () => {
    // Client disconnected
  });
});

// Start Server and connect to MongoDB
const startServer = async () => {
  try {
    // 1. Immediately listen on port 5000 so all incoming API requests (login, auth, health) are served without delay
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 RideFlow Backend Express + Socket.IO Server running on http://localhost:${PORT}`);
    });

    // 2. Connect to MongoDB Atlas
    const isMongoConnected = await connectDB();
    console.log(`📡 Database status: ${isMongoConnected ? 'Connected to MongoDB Atlas' : 'Running with Persistent Local DB'}`);

    // 3. Seed users & vehicles in background (non-blocking)
    seedUsers().catch((err) => console.warn('[Auth Seed Warning]', err.message));
    seedVehicles().catch((err) => console.warn('[Fleet Seed Warning]', err.message));
  } catch (error) {
    console.error('Failed to start RideFlow server:', error);
  }
};

startServer();
