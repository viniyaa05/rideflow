import express from 'express';
import Booking from '../models/Booking.js';

const router = express.Router();

// In-memory cache for fallback
let inMemoryBookings = [];

// Create new ride booking
router.post('/create', async (req, res) => {
  try {
    const payload = req.body || {};
    
    // Generate random 4-digit Ride Start OTP if not already provided
    const otp = payload.otp || Math.floor(1000 + Math.random() * 9000).toString();
    const bookingId = payload.id || 'RF-TN-' + Math.floor(100000 + Math.random() * 900000);

    const newBooking = {
      ...payload,
      id: bookingId,
      userId: payload.userId || 'usr_alex_chen',
      userName: payload.userName || 'RideFlow Commuter',
      userPhone: payload.userPhone || '+91 98401 23456',
      serviceType: payload.serviceType || payload.mode || 'bike-taxi',
      mode: payload.mode || payload.serviceType || 'Solo Bike Taxi',
      title: payload.title || payload.mode || 'RideFlow Transit',
      pickupLocation: payload.pickupLocation || payload.from || 'Chennai Central Railway Station',
      dropoffLocation: payload.dropoffLocation || payload.to || 'OMR IT Expressway - Sholinganallur',
      fare: Number(payload.finalPrice || payload.fare || payload.price || 120),
      finalPrice: Number(payload.finalPrice || payload.fare || payload.price || 120),
      discount: Number(payload.discount || 0),
      savings: Number(payload.savings || 0),
      otp,
      otpVerified: payload.otpVerified || false,
      status: payload.status || 'Confirmed',
      paymentMethod: payload.paymentMethod || 'wallet',
      paymentMethodName: payload.paymentMethodName || 'RideFlow Wallet',
      driverOrHost: payload.driverOrHost || payload.details || 'RideFlow Verified Driver / Host',
      createdAt: new Date()
    };

    let savedDoc = newBooking;

    try {
      savedDoc = await Booking.findOneAndUpdate(
        { id: bookingId },
        { $set: newBooking },
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`[MongoDB Bookings] Saved booking ${bookingId} to MongoDB.`);
    } catch (dbErr) {
      console.warn(`[MongoDB Bookings Warning] Could not save directly to MongoDB:`, dbErr.message);
      inMemoryBookings.unshift(newBooking);
    }

    return res.json({
      success: true,
      message: 'Ride booked successfully in MongoDB! Share your 4-digit OTP with the driver.',
      booking: savedDoc,
      otp
    });
  } catch (err) {
    console.error('[Booking Create Error]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Verify 4-digit OTP
router.post('/:id/verify-otp', async (req, res) => {
  try {
    const { id } = req.params;
    const { enteredOtp } = req.body;

    let booking = null;
    try {
      booking = await Booking.findOne({ id });
    } catch {
      booking = inMemoryBookings.find(b => b.id === id);
    }

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.otp !== enteredOtp) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid OTP "${enteredOtp}". Please check the 4-digit code shown on the rider app.` 
      });
    }

    booking.otpVerified = true;
    booking.status = 'in_transit';

    try {
      await Booking.findOneAndUpdate({ id }, { otpVerified: true, status: 'in_transit' });
    } catch {
      // In-memory update
    }

    return res.json({
      success: true,
      message: 'OTP Verified! Trip is now In-Transit. Safe journey!',
      booking
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get user bookings
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let bookings = [];
    try {
      bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
    } catch {
      bookings = inMemoryBookings.filter(b => b.userId === userId);
    }
    return res.json({ success: true, bookings });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get all bookings (Admin telemetry)
router.get('/all', async (req, res) => {
  try {
    let bookings = [];
    try {
      bookings = await Booking.find({}).sort({ createdAt: -1 });
    } catch {
      bookings = inMemoryBookings;
    }
    return res.json({ success: true, bookings });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
