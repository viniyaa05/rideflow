import express from 'express';
import { bookingService } from '../services/bookingService.js';

const router = express.Router();

/**
 * POST /create - Create new ride booking
 */
router.post('/create', async (req, res) => {
  try {
    const payload = req.body || {};
    const { booking, otp } = await bookingService.createBooking(payload);

    return res.status(201).json({
      success: true,
      message: 'Ride booked successfully! Share your 4-digit OTP with the driver upon arrival.',
      booking,
      otp
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
 * POST /check-conflict - Validate if driver or vehicle is free at specified date & time
 */
router.post('/check-conflict', (req, res) => {
  try {
    const payload = req.body || {};
    const conflictResult = bookingService.checkBookingConflict(payload);
    return res.json({
      success: true,
      hasConflict: conflictResult.hasConflict,
      message: conflictResult.message || 'Slot available'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /:id/verify-otp - Captain verifies 4-digit ride start OTP
 */
router.post('/:id/verify-otp', async (req, res) => {
  try {
    const { id } = req.params;
    const { enteredOtp } = req.body;

    const result = await bookingService.verifyRideOTP(id, enteredOtp);
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
 * POST /:id/cancel - Instant 100% cancellation refund & carpool seat release
 */
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await bookingService.cancelBooking(id, reason);
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
 * GET /user/:userId - Fetch bookings for passenger
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await bookingService.getUserBookings(userId);

    return res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
