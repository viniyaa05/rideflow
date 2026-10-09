import express from 'express';
import { authService } from '../services/authService.js';
import User from '../models/User.js';
import { dbStore } from '../services/dbStore.js';

const router = express.Router();

// Fallback seeded personas for initial database bootstrapping
const SEEDED_USERS = [
  {
    id: 'usr_alex_chen',
    name: 'Alex Chen',
    phone: '+91 98401 23456',
    email: 'alex.chen@gmail.com',
    password: 'alex123',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    rating: 4.95,
    tripsCount: 142,
    walletBalance: 1250,
    strikes: 0,
    isSuspended: false
  },
  {
    id: 'usr_pooja_sundaram',
    name: 'Pooja Sundaram',
    phone: '+91 98409 11223',
    email: 'pooja.sundaram@gmail.com',
    password: 'pooja123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    rating: 4.88,
    tripsCount: 38,
    walletBalance: 420,
    strikes: 0,
    isSuspended: false
  },
  {
    id: 'usr_karthik_raja',
    name: 'Karthik Raja',
    phone: '+91 97890 55443',
    email: 'karthik.raja@yahoo.com',
    password: 'karthik123',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    rating: 4.92,
    tripsCount: 210,
    walletBalance: 2400,
    strikes: 0,
    isSuspended: false
  },
  {
    id: 'usr_ananya_sharma',
    name: 'Ananya Sharma',
    phone: '+91 98840 99887',
    email: 'ananya.sharma@outlook.com',
    password: 'ananya123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    rating: 4.79,
    tripsCount: 19,
    walletBalance: 180,
    strikes: 0,
    isSuspended: false
  },
  {
    id: 'usr_super_admin',
    name: 'Super Admin Officer',
    phone: '+91 94440 99999',
    email: 'admin@rideflow.in',
    password: 'admin123',
    role: 'admin',
    isAdmin: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    rating: 5.0,
    tripsCount: 420,
    walletBalance: 50000,
    strikes: 0,
    isSuspended: false
  },
  {
    id: 'usr_admin_tn',
    name: 'Tamil Nadu Admin',
    phone: '+91 99999 00000',
    email: 'admin@rideflow.tn.gov.in',
    password: 'admin123',
    role: 'admin',
    isAdmin: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    rating: 5.0,
    tripsCount: 0,
    walletBalance: 99999,
    strikes: 0,
    isSuspended: false
  }
];

export const seedUsers = async () => {
  try {
    for (const u of SEEDED_USERS) {
      dbStore.addUser(u);
    }
    const ops = SEEDED_USERS.map((u) => ({
      updateOne: {
        filter: { id: u.id },
        update: { $set: u },
        upsert: true
      }
    }));
    await User.bulkWrite(ops, { ordered: false });
    await User.updateMany(
      { email: { $in: ['admin@rideflow.in', 'admin@rideflow.tn.gov.in'] } },
      { $set: { role: 'admin', isAdmin: true } }
    );
    console.log('[Auth Routes] Personas synchronized to MongoDB and local store.');
  } catch (err) {
    console.warn('[Auth Routes] Seeding notice:', err.message);
  }
};

/**
 * Cookie options helper
 */
const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

/**
 * POST /login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const { user, token } = await authService.login({ email, phone, password });

    res.cookie('rideflow_token', token, getAuthCookieOptions());

    return res.json({
      success: true,
      message: 'Login successful!',
      user,
      token
    });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: err.message,
      user: err.user
    });
  }
});

/**
 * POST /register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const { user, token } = await authService.register({ name, email, phone, password, role });

    res.cookie('rideflow_token', token, getAuthCookieOptions());

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user,
      token
    });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /me (Session verification endpoint)
 */
router.get('/me', async (req, res) => {
  try {
    const cookieToken = req.cookies?.rideflow_token;
    const authHeader = req.headers?.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        error: 'No active session token found'
      });
    }

    const decoded = authService.verifyToken(token);
    if (!decoded) {
      res.clearCookie('rideflow_token', getAuthCookieOptions());
      return res.status(401).json({
        success: false,
        authenticated: false,
        error: 'Invalid or expired session token'
      });
    }

    const user = await authService.getMe(decoded);

    return res.json({
      success: true,
      authenticated: true,
      user,
      token
    });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      authenticated: false,
      error: err.message
    });
  }
});

/**
 * POST /logout
 */
router.post('/logout', (req, res) => {
  res.clearCookie('rideflow_token', getAuthCookieOptions());
  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * POST /google (OAuth verification)
 */
router.post('/google', async (req, res) => {
  try {
    const googleData = req.body;
    const { user, token } = await authService.googleAuth(googleData);

    res.cookie('rideflow_token', token, getAuthCookieOptions());

    return res.json({
      success: true,
      message: 'Google authentication successful',
      user,
      token
    });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Legacy compatibility alias for oauth sync
 */
router.post('/oauth-sync', async (req, res) => {
  try {
    const { user, token } = await authService.googleAuth(req.body);
    res.cookie('rideflow_token', token, getAuthCookieOptions());
    return res.json({ success: true, user, token, mongoSaved: true });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
});

/**
 * POST /request-reset
 */
router.post('/request-reset', async (req, res) => {
  try {
    const { identifier } = req.body;
    const result = await authService.requestReset(identifier);
    return res.json(result);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /reset-password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    const result = await authService.resetPassword({ identifier, otp, newPassword });
    return res.json(result);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
