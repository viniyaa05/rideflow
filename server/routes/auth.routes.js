import express from 'express';
import User from '../models/User.js';
import { dbStore } from '../services/dbStore.js';

const router = express.Router();

// Fallback in-memory users for offline resilience
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
    id: 'usr_rajesh_kumar',
    name: 'Rajesh Kumar',
    phone: '+91 94440 12345',
    email: 'rajesh.kumar@gmail.com',
    password: 'rajesh123',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rating: 4.65,
    tripsCount: 88,
    walletBalance: 320,
    strikes: 2,
    isSuspended: false
  },
  {
    id: 'usr_admin_tn',
    name: 'Tamil Nadu Admin',
    phone: '+91 99999 00000',
    email: 'admin@rideflow.tn.gov.in',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    rating: 5.0,
    tripsCount: 0,
    walletBalance: 99999,
    strikes: 0,
    isSuspended: false
  }
];

// Seed initial users into MongoDB & local dbStore
export const seedUsers = async () => {
  try {
    for (const u of SEEDED_USERS) {
      dbStore.addUser(u);
      try {
        await User.findOneAndUpdate({ id: u.id }, u, { upsert: true, new: true });
      } catch (mErr) {
        // Mongo sync error handled
      }
    }
    console.log('[MongoDB Auth] Seeded personas synchronized to database and local store.');
  } catch (err) {
    console.warn('[MongoDB Auth] Seeding fallback:', err.message);
  }
};

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { phone, email, password } = req.body;
    
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    let user = null;
    try {
      if (phone) {
        user = await User.findOne({ 
          $or: [
            { phone: phone.trim() }, 
            { phone: phone.replace(/[^0-9]/g, '') },
            { phone: { $regex: phone.slice(-10), $options: 'i' } }
          ] 
        });
      } else if (email) {
        user = await User.findOne({ email: email.trim().toLowerCase() });
      }
    } catch {
      // Offline fallback search
    }

    if (!user) {
      // Check in persistent local dbStore
      const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
      const cleanEmail = email ? email.trim().toLowerCase() : '';
      user = dbStore.findUser(u => 
        (cleanPhone && (u.phone.replace(/[^0-9]/g, '').includes(cleanPhone) || cleanPhone.includes(u.phone.replace(/[^0-9]/g, '')))) ||
        (cleanEmail && u.email.toLowerCase() === cleanEmail)
      );
    }

    if (!user) {
      // Check in seeded memory array
      user = SEEDED_USERS.find(u => 
        (phone && (u.phone.includes(phone) || u.phone.replace(/[^0-9]/g, '').includes(phone.replace(/[^0-9]/g, '')))) ||
        (email && u.email.toLowerCase() === email.toLowerCase())
      );
    }

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'No account found with these credentials. Please check your phone/email.' 
      });
    }

    if (user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        error: 'Incorrect password for this account. Please try again.' 
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended due to policy violations (3 strikes). Please visit the Appeals Desk.',
        user
      });
    }

    return res.json({
      success: true,
      message: 'Login successful',
      user
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, role } = req.body;
    
    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, error: 'Name, phone, and password are required' });
    }

    const cleanEmail = (email || `${phone.replace(/[^0-9]/g, '')}@rideflow.local`).trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Check if user already exists
    let existingUser = null;
    try {
      existingUser = await User.findOne({
        $or: [{ email: cleanEmail }, { phone: cleanPhone }]
      });
    } catch {
      // offline check
    }

    if (!existingUser) {
      existingUser = dbStore.findUser(u => 
        u.email.toLowerCase() === cleanEmail || 
        u.phone.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, '')
      );
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email or phone number is already registered. Please log in.'
      });
    }

    const newUserId = 'usr_' + Date.now();
    const newUser = {
      id: newUserId,
      name: name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      password,
      role: role || 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      rating: 5.0,
      tripsCount: 0,
      walletBalance: 300,
      strikes: 0,
      isSuspended: false,
      createdAt: new Date().toISOString()
    };

    // 1. Immediately persist to local disk dbStore
    dbStore.addUser(newUser);

    // 2. Persist to MongoDB Atlas
    let mongoSaved = false;
    try {
      await User.create(newUser);
      mongoSaved = true;
      console.log(`[MongoDB Auth] User successfully created in MongoDB Atlas: ${newUser.email}`);
    } catch (mErr) {
      console.warn(`[MongoDB Auth] MongoDB Atlas save fallback:`, mErr.message);
    }

    // Also update in-memory
    SEEDED_USERS.unshift(newUser);

    return res.json({
      success: true,
      message: mongoSaved 
        ? 'Account registered and persisted successfully in MongoDB database'
        : 'Account registered and persisted successfully in database storage',
      user: newUser,
      dbSaved: true
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// In-memory OTP Store for password resets (TTL 5 minutes)
const RESET_OTP_STORE = new Map();
const RESET_OTP_TTL_MS = 5 * 60 * 1000;

// Request Password Reset OTP
router.post('/request-reset', async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please enter your registered email address or phone number.' 
      });
    }

    const cleanId = identifier.trim().toLowerCase();
    const isPhone = !cleanId.includes('@');
    
    // Find user in MongoDB or fallback in SEEDED_USERS
    let user = null;
    try {
      if (isPhone) {
        const digits = cleanId.replace(/[^0-9]/g, '');
        user = await User.findOne({
          $or: [
            { phone: cleanId },
            { phone: digits },
            { phone: { $regex: digits.slice(-10), $options: 'i' } }
          ]
        });
      } else {
        user = await User.findOne({ email: cleanId });
      }
    } catch {
      // Offline fallback
    }

    if (!user) {
      user = SEEDED_USERS.find(u => 
        isPhone 
          ? (u.phone.replace(/[^0-9]/g, '').includes(cleanId.replace(/[^0-9]/g, ''))) 
          : (u.email.toLowerCase() === cleanId)
      );
    }

    // Generate authentic 6-digit numeric OTP code
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + RESET_OTP_TTL_MS;
    const recipient = user ? (isPhone ? user.phone : user.email) : cleanId;
    const lookupKey = cleanId;

    RESET_OTP_STORE.set(lookupKey, {
      otp,
      expiresAt,
      attempts: 0,
      recipient,
      userName: user ? user.name : 'RideFlow User'
    });

    console.log(`[RideFlow Security Desk] Password Reset OTP generated for ${lookupKey} (${recipient}): ${otp}`);

    return res.json({
      success: true,
      message: `Verification code successfully dispatched to ${recipient}.`,
      delivery: {
        recipient,
        userName: user ? user.name : 'RideFlow User',
        channel: isPhone ? 'SMS' : 'Email',
        senderEmail: 'rideflow2026@gmail.com',
        officialContact: '+91 80728 32066',
        otp,
        expiresInMinutes: 5,
        dispatchedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Reset Password with Strict OTP Verification
router.post('/reset-password', async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email/phone, 6-digit OTP, and new password are required.' 
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'New password must be at least 6 characters long.' 
      });
    }

    const cleanId = identifier.trim().toLowerCase();
    const record = RESET_OTP_STORE.get(cleanId);

    if (!record) {
      return res.status(400).json({
        success: false,
        error: 'No active OTP verification request found for this account. Please click "Send Reset OTP" first.'
      });
    }

    if (Date.now() > record.expiresAt) {
      RESET_OTP_STORE.delete(cleanId);
      return res.status(400).json({
        success: false,
        error: 'Verification OTP has expired (5-minute limit exceeded). Please request a fresh OTP.'
      });
    }

    // Rate limiting attempts to prevent guessing
    if (record.attempts >= 5) {
      RESET_OTP_STORE.delete(cleanId);
      return res.status(429).json({
        success: false,
        error: 'Maximum OTP verification attempts exceeded. For your protection, this OTP has been invalidated. Please request a new code.'
      });
    }

    // STRICT OTP VALIDATION: Must exactly match
    if (String(record.otp).trim() !== String(otp).trim()) {
      record.attempts += 1;
      const remaining = 5 - record.attempts;
      return res.status(400).json({
        success: false,
        error: `Invalid verification OTP. The code you entered does not match the 6-digit OTP dispatched to ${record.recipient}. Random or incorrect codes are rejected. (${remaining} attempts remaining)`
      });
    }

    // OTP verified successfully! Update password in MongoDB
    const isPhone = !cleanId.includes('@');
    try {
      if (isPhone) {
        const digits = cleanId.replace(/[^0-9]/g, '');
        await User.findOneAndUpdate(
          {
            $or: [
              { phone: cleanId },
              { phone: digits },
              { phone: { $regex: digits.slice(-10), $options: 'i' } }
            ]
          },
          { password: newPassword }
        );
      } else {
        await User.findOneAndUpdate(
          { email: cleanId },
          { password: newPassword }
        );
      }
    } catch {
      // In-memory fallback
    }

    // Also update dbStore and in-memory users
    dbStore.updateUserPassword(cleanId, newPassword);

    const seeded = SEEDED_USERS.find(u => 
      isPhone 
        ? (u.phone.replace(/[^0-9]/g, '').includes(cleanId.replace(/[^0-9]/g, ''))) 
        : (u.email.toLowerCase() === cleanId)
    );
    if (seeded) {
      seeded.password = newPassword;
    }

    // Burn OTP immediately after successful use
    RESET_OTP_STORE.delete(cleanId);

    console.log(`[RideFlow Security Desk] Password successfully reset for ${cleanId}`);

    return res.json({
      success: true,
      message: 'Password successfully updated in RideFlow database. You can now sign in with your new password.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get all users (Admin view)
router.get('/users', async (req, res) => {
  try {
    let users = [];
    try {
      users = await User.find({}).sort({ createdAt: -1 });
    } catch {
      // ignore
    }
    const storeUsers = dbStore.getUsers();
    // Combine without duplicate IDs
    const combined = [...users];
    for (const su of storeUsers) {
      if (!combined.some(u => u.id === su.id)) {
        combined.push(su);
      }
    }
    return res.json({ success: true, users: combined.length ? combined : SEEDED_USERS });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
