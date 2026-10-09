import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { dbStore } from './dbStore.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from './mailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'rideflow_secure_jwt_secret_2026_chennai';
const JWT_EXPIRES_IN = '7d';

export const authService = {
  /**
   * Signs a JWT for a user
   */
  generateToken(user) {
    const payload = {
      sub: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || 'user',
      isAdmin: Boolean(user.role === 'admin' || user.role === 'SUPER_ADMIN' || user.isAdmin === true || user.email?.toLowerCase() === 'admin@rideflow.tn.gov.in' || user.email?.toLowerCase() === 'admin@rideflow.in'),
      walletBalance: user.walletBalance || 0
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  /**
   * Verifies and decodes a JWT token
   */
  verifyToken(token) {
    try {
      if (!token) return null;
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  },

  /**
   * Authenticate user with phone/email and password
   */
  async login({ email, phone, password }) {
    if (!password) {
      const err = new Error('Password is required');
      err.statusCode = 400;
      throw err;
    }

    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const cleanPhone = phone ? phone.trim() : null;

    let user = null;

    // Search in MongoDB
    try {
      if (cleanEmail) {
        user = await User.findOne({ email: cleanEmail });
      } else if (cleanPhone) {
        user = await User.findOne({
          $or: [
            { phone: cleanPhone },
            { phone: cleanPhone.replace(/[^0-9]/g, '') },
            { phone: { $regex: cleanPhone.slice(-10), $options: 'i' } }
          ]
        });
      }
    } catch (dbErr) {
      console.warn('[AuthService] MongoDB lookup notice:', dbErr.message);
    }

    // Fallback to local persistent dbStore if DB is offline or seeding
    if (!user) {
      const digits = cleanPhone ? cleanPhone.replace(/[^0-9]/g, '') : '';
      user = dbStore.findUser((u) => 
        (cleanEmail && u.email?.toLowerCase() === cleanEmail) ||
        (cleanPhone && (u.phone === cleanPhone || (digits && u.phone?.replace(/[^0-9]/g, '').includes(digits))))
      );
    }

    if (!user) {
      const err = new Error('No account found with these credentials. Please check your details or sign up.');
      err.statusCode = 404;
      throw err;
    }

    // Strict Password Verification
    const isPasswordValid = user.password === password;
    if (!isPasswordValid) {
      const err = new Error('Incorrect password for this account. Please enter the correct password.');
      err.statusCode = 401;
      throw err;
    }

    // Check 3-strike suspension
    if (user.isSuspended || (user.strikes && user.strikes >= 3)) {
      const err = new Error('Your account has been suspended due to policy violations (3 strikes). Please visit the Appeals Desk.');
      err.statusCode = 403;
      err.user = user;
      throw err;
    }

    const isUserAdmin = Boolean(
      user.role === 'admin' ||
      user.role === 'SUPER_ADMIN' ||
      user.isAdmin === true ||
      cleanEmail === 'admin@rideflow.in' ||
      cleanEmail === 'admin@rideflow.tn.gov.in' ||
      user.id === 'usr_super_admin' ||
      user.id === 'usr_admin_tn'
    );
    if (isUserAdmin) {
      user.role = 'admin';
      user.isAdmin = true;
    }

    const token = this.generateToken(user);

    // Format safe user response (omit password)
    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.password;
    if (isUserAdmin) {
      safeUser.role = 'admin';
      safeUser.isAdmin = true;
    }

    return { user: safeUser, token };
  },

  /**
   * Register a new user
   */
  async register({ name, email, phone, password, role = 'user' }) {
    if (!name || !password) {
      const err = new Error('Name and password are required');
      err.statusCode = 400;
      throw err;
    }

    const cleanEmail = (email || `${(phone || 'user').replace(/[^0-9]/g, '')}@rideflow.local`).trim().toLowerCase();
    const cleanPhone = phone ? phone.trim() : '+91 98401 ' + Math.floor(10000 + Math.random() * 90000);

    // Check duplicate
    let existing = null;
    try {
      existing = await User.findOne({ $or: [{ email: cleanEmail }, { phone: cleanPhone }] });
    } catch {}

    if (!existing) {
      existing = dbStore.findUser((u) => u.email?.toLowerCase() === cleanEmail || u.phone === cleanPhone);
    }

    if (existing) {
      const err = new Error('An account with this email or phone number is already registered. Please sign in.');
      err.statusCode = 409;
      throw err;
    }

    const userId = 'usr_' + Date.now();
    const newUserDoc = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password,
      role: role || 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      rating: 5.0,
      tripsCount: 0,
      walletBalance: 500,
      strikes: 0,
      isSuspended: false,
      oauthProvider: 'local',
      createdAt: new Date()
    };

    let savedUser = newUserDoc;
    try {
      savedUser = await User.create(newUserDoc);
    } catch (mErr) {
      console.warn('[AuthService] MongoDB register warning:', mErr.message);
    }

    dbStore.addUser(newUserDoc);

    // Send welcome email asynchronously
    sendWelcomeEmail({ to: cleanEmail, userName: name.trim() }).catch(() => {});

    const token = this.generateToken(savedUser);
    const safeUser = savedUser.toObject ? savedUser.toObject() : { ...savedUser };
    delete safeUser.password;

    return { user: safeUser, token };
  },

  /**
   * Fetch current session user from token
   */
  async getMe(decodedToken) {
    if (!decodedToken || !decodedToken.sub) {
      const err = new Error('Unauthorized');
      err.statusCode = 401;
      throw err;
    }

    let user = null;
    try {
      user = await User.findOne({ id: decodedToken.sub });
    } catch {}

    if (!user) {
      user = dbStore.findUser((u) => u.id === decodedToken.sub || u.email?.toLowerCase() === decodedToken.email?.toLowerCase());
    }

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.password;

    return safeUser;
  },

  /**
   * Authenticate / Synchronize Google OAuth User
   */
  async googleAuth(googleData) {
    if (!googleData || !googleData.email) {
      const err = new Error('Invalid Google credential payload');
      err.statusCode = 400;
      throw err;
    }

    const cleanEmail = googleData.email.trim().toLowerCase();
    const displayName = googleData.name || cleanEmail.split('@')[0];

    let user = null;
    try {
      user = await User.findOne({ email: cleanEmail });
    } catch {}

    if (!user) {
      user = dbStore.findUser((u) => u.email?.toLowerCase() === cleanEmail);
    }

    if (!user) {
      // Create new Google user
      const newUserId = 'usr_g_' + Date.now();
      const newUserDoc = {
        id: newUserId,
        name: displayName,
        email: cleanEmail,
        phone: googleData.phone || '+91 98401 ' + Math.floor(10000 + Math.random() * 90000),
        password: 'oauth_google_' + Math.random().toString(36),
        role: 'user',
        avatar: googleData.avatar || googleData.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4285F4&color=fff`,
        rating: 5.0,
        tripsCount: 0,
        walletBalance: 500,
        strikes: 0,
        isSuspended: false,
        oauthProvider: 'google',
        createdAt: new Date()
      };

      try {
        user = await User.create(newUserDoc);
      } catch {
        user = newUserDoc;
      }
      dbStore.addUser(user);
    }

    const token = this.generateToken(user);
    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.password;

    return { user: safeUser, token };
  },

  /**
   * Request password reset OTP
   */
  async requestReset(identifier) {
    if (!identifier) {
      const err = new Error('Email or phone number is required');
      err.statusCode = 400;
      throw err;
    }

    const clean = identifier.trim().toLowerCase();
    let user = null;
    try {
      user = await User.findOne({ $or: [{ email: clean }, { phone: clean }] });
    } catch {}

    if (!user) {
      user = dbStore.findUser((u) => u.email?.toLowerCase() === clean || u.phone === clean);
    }

    if (!user) {
      if (clean.includes('@')) {
        // Automatically create account doc in MongoDB so ANY valid email can receive an OTP and register/reset
        const newUserId = 'usr_' + Date.now();
        const newUserDoc = {
          id: newUserId,
          name: clean.split('@')[0],
          email: clean,
          phone: '+91 98401 ' + Math.floor(10000 + Math.random() * 90000),
          password: 'temp_' + Math.random().toString(36),
          role: 'user',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(clean)}`,
          rating: 5.0,
          tripsCount: 0,
          walletBalance: 500,
          strikes: 0,
          isSuspended: false,
          oauthProvider: 'local',
          createdAt: new Date()
        };
        try {
          user = await User.create(newUserDoc);
        } catch {
          user = newUserDoc;
        }
        dbStore.addUser(user);
      } else {
        const err = new Error('No account found with this phone number. Please use your email address or create an account.');
        err.statusCode = 404;
        throw err;
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins TTL

    dbStore.setResetOTP(user.email, { otp, expiresAt, userId: user.id });

    // Send email via Gmail SMTP (delivers to all domains: Gmail, Yahoo, Outlook, custom corporate/edu domains)
    let emailSent = false;
    let mailError = null;
    try {
      const mailRes = await sendPasswordResetEmail({
        to: user.email,
        userName: user.name,
        otp
      });
      emailSent = mailRes.sent === true;
      if (!emailSent) {
        mailError = mailRes.reason;
      }
    } catch (mErr) {
      mailError = mErr.message;
    }

    if (!emailSent) {
      console.warn(`[AuthService] Password reset email could not be sent to ${user.email}:`, mailError);
      const err = new Error(`Failed to deliver verification email to ${user.email}. Please verify that the email address is valid and can receive mail.`);
      err.statusCode = 502;
      throw err;
    }

    return {
      success: true,
      email: user.email,
      emailSent,
      expiresInMinutes: 5,
      delivery: {
        recipient: user.email,
        userName: user.name,
        channel: 'Email',
        senderEmail: 'rideflow2026@gmail.com',
        dispatchedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        emailSent
      }
    };
  },

  /**
   * Reset password using OTP
   */
  async resetPassword({ identifier, otp, newPassword }) {
    if (!identifier || !otp || !newPassword) {
      const err = new Error('Identifier, OTP, and new password are required');
      err.statusCode = 400;
      throw err;
    }

    const clean = identifier.trim().toLowerCase();
    const resetRecord = dbStore.getResetOTP(clean);

    if (!resetRecord || resetRecord.otp !== otp) {
      const err = new Error('Invalid or expired OTP. Please request a new code.');
      err.statusCode = 400;
      throw err;
    }

    if (Date.now() > resetRecord.expiresAt) {
      dbStore.deleteResetOTP(clean);
      const err = new Error('OTP has expired. Please request a new code.');
      err.statusCode = 400;
      throw err;
    }

    // Update in MongoDB
    try {
      await User.findOneAndUpdate({ $or: [{ email: clean }, { id: resetRecord.userId }] }, { password: newPassword });
    } catch {}

    dbStore.updateUserPassword(clean, newPassword);
    dbStore.deleteResetOTP(clean);

    return { success: true, message: 'Password updated successfully. You can now log in.' };
  }
};
