import Booking from '../models/Booking.js';
import { dbStore } from './dbStore.js';
import { paymentService } from './paymentService.js';
import { carpoolService } from './carpoolService.js';
import { sendBookingConfirmationEmail } from './mailService.js';
import { sendBookingConfirmationSMS } from './smsService.js';

export const bookingService = {
  /**
   * Generate 4-digit ride start OTP
   */
  generateRideOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  },

  /**
   * Check if a vehicle/driver is already booked by another user for the same time slot
   */
  checkBookingConflict({ targetId, driverId, vehicleId, title, scheduledDate, scheduledTime, isScheduled, currentBookingId }) {
    const existingBookings = dbStore.getBookings() || [];
    const resourceKey = (targetId || vehicleId || driverId || title || '').trim().toLowerCase();
    const dateKey = (scheduledDate || new Date().toISOString().split('T')[0]).trim();
    const timeKey = isScheduled ? (scheduledTime || '09:00 AM').trim().toLowerCase() : 'now';

    if (!resourceKey) return { hasConflict: false };

    const conflict = existingBookings.find((b) => {
      if (b.status === 'Cancelled') return false;
      if (currentBookingId && b.id === currentBookingId) return false;

      const bResource = (b.targetId || b.vehicleId || b.driverId || b.title || b.vehicle || '').trim().toLowerCase();
      // Check if same resource/vehicle/driver
      const isSameResource = bResource === resourceKey || (resourceKey.length > 5 && bResource.includes(resourceKey)) || (bResource.length > 5 && resourceKey.includes(bResource));
      if (!isSameResource) return false;

      const bDate = (b.scheduledDate || (b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : '')).trim();
      if (bDate && dateKey && bDate !== dateKey) return false;

      const bTime = b.isScheduled ? (b.scheduledTime || '').trim().toLowerCase() : 'now';

      // If exact time slot match or both booked for 'now' within active window
      if (bTime === timeKey) return true;
      if (isScheduled && b.isScheduled && bTime === timeKey) return true;

      return false;
    });

    if (conflict) {
      return {
        hasConflict: true,
        conflictBooking: conflict,
        message: `This service (${title || 'vehicle/driver'}) is already reserved by another commuter for ${dateKey} at ${isScheduled ? scheduledTime : 'this moment'}. Please choose a different timing or select another available vehicle/driver.`
      };
    }

    return { hasConflict: false };
  },

  /**
   * Create a new booking with payment deduction, carpool seat decrement, conflict validation and email notification
   */
  async createBooking(payload) {
    const bookingId = payload.id || 'RF-TN-' + Math.floor(100000 + Math.random() * 900000);
    const otp = payload.otp || this.generateRideOTP();
    const fare = Number(payload.finalPrice || payload.fare || payload.price || 120);
    const userId = payload.userId || 'usr_alex_chen';
    const isWalletPay = payload.paymentMethod === 'wallet' || !payload.paymentMethod;

    // 0. Time Slot & Resource Conflict Validation
    const conflictCheck = this.checkBookingConflict({
      targetId: payload.targetId || payload.carpoolId || payload.rentalId,
      vehicleId: payload.vehicleId,
      driverId: payload.driverId,
      title: payload.title || payload.mode,
      scheduledDate: payload.scheduledDate,
      scheduledTime: payload.scheduledTime,
      isScheduled: Boolean(payload.isScheduled),
      currentBookingId: bookingId
    });

    if (conflictCheck.hasConflict) {
      const conflictErr = new Error(conflictCheck.message);
      conflictErr.statusCode = 409; // HTTP 409 Conflict
      throw conflictErr;
    }

    // 1. If paying with wallet, deduct wallet balance
    if (isWalletPay && fare > 0) {
      try {
        await paymentService.deductWallet(userId, fare);
      } catch (payErr) {
        // If insufficient balance, reject booking creation
        if (payErr.statusCode === 402) {
          throw payErr;
        }
      }
    }

    // 2. If Carpool mode, atomically decrement seats
    const poolId = payload.carpoolId || payload.targetId;
    if (poolId && (payload.serviceType === 'carpool' || payload.mode?.includes('Carpool'))) {
      const seatResult = await carpoolService.bookSeatAtomic(poolId, payload.seats || 1);
      if (!seatResult.success) {
        // Refund wallet if already deducted
        if (isWalletPay && fare > 0) {
          await paymentService.refundWallet(userId, fare, 'Carpool seat unavailable');
        }
        const err = new Error(seatResult.error || 'No seats available for this carpool');
        err.statusCode = 400;
        throw err;
      }
    }

    const newBooking = {
      ...payload,
      id: bookingId,
      userId,
      userName: payload.userName || 'RideFlow Commuter',
      userPhone: payload.userPhone || '+91 98401 23456',
      serviceType: payload.serviceType || payload.mode || 'bike-taxi',
      mode: payload.mode || payload.serviceType || 'Solo Bike Taxi',
      title: payload.title || payload.mode || 'RideFlow Transit',
      pickupLocation: payload.pickupLocation || payload.from || 'Chennai Central Railway Station',
      dropoffLocation: payload.dropoffLocation || payload.to || 'OMR IT Expressway - Sholinganallur',
      fare,
      finalPrice: fare,
      discount: Number(payload.discount || 0),
      savings: Number(payload.savings || 0),
      otp,
      otpVerified: false,
      status: 'Confirmed',
      paymentMethod: payload.paymentMethod || 'wallet',
      paymentMethodName: payload.paymentMethodName || 'RideFlow Wallet',
      driverOrHost: payload.driverOrHost || payload.details || 'RideFlow Verified Driver / Host',
      assignedDriverName: payload.assignedDriverName || payload.driverOrHost || 'RideFlow Captain',
      carpoolId: poolId,
      isScheduled: Boolean(payload.isScheduled),
      scheduledDate: payload.scheduledDate || (payload.isScheduled ? new Date().toISOString().split('T')[0] : null),
      scheduledTime: payload.scheduledTime || (payload.isScheduled ? '09:00 AM' : 'Now'),
      driverVehicleType: payload.driverVehicleType || (payload.mode?.toLowerCase().includes('bike') ? 'two-wheeler' : 'car'),
      userEmail: payload.userEmail || dbStore.findUser((u) => u.id === userId)?.email || 'alex.chen@gmail.com',
      createdAt: new Date()
    };

    // 1. Dispatch booking confirmation & billing email
    try {
      const emailResult = await sendBookingConfirmationEmail({
        to: newBooking.userEmail,
        userName: newBooking.userName,
        booking: newBooking
      });
      newBooking.emailReceipt = {
        sent: Boolean(emailResult.sent),
        simulated: Boolean(emailResult.simulated),
        recipient: newBooking.userEmail,
        sentAt: new Date().toISOString(),
        emailPayload: emailResult.emailPayload
      };
    } catch (mailErr) {
      console.warn('[BookingService] Confirmation email warning:', mailErr.message);
      newBooking.emailReceipt = {
        sent: false,
        error: mailErr.message,
        recipient: newBooking.userEmail
      };
    }

    // 2. Dispatch booking confirmation SMS message
    try {
      const smsResult = await sendBookingConfirmationSMS({
        toPhone: newBooking.userPhone,
        userName: newBooking.userName,
        booking: newBooking
      });
      newBooking.smsReceipt = {
        sent: Boolean(smsResult.sent),
        simulated: Boolean(smsResult.simulated),
        recipient: smsResult.recipient,
        sentAt: new Date().toISOString(),
        smsText: smsResult.smsText,
        messageId: smsResult.messageId
      };
    } catch (smsErr) {
      console.warn('[BookingService] Confirmation SMS warning:', smsErr.message);
      newBooking.smsReceipt = {
        sent: false,
        error: smsErr.message,
        recipient: newBooking.userPhone
      };
    }

    // Save to dbStore
    dbStore.addBooking(newBooking);

    let saved = newBooking;
    try {
      saved = await Booking.findOneAndUpdate(
        { id: bookingId },
        { $set: newBooking },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (err) {
      console.warn('[BookingService] MongoDB save warning:', err.message);
    }

    return { booking: saved, otp };
  },

  /**
   * Captain verifies 4-digit ride OTP to start trip
   */
  async verifyRideOTP(bookingId, inputOtp) {
    if (!bookingId || !inputOtp) {
      const err = new Error('Booking ID and OTP are required');
      err.statusCode = 400;
      throw err;
    }

    let booking = null;
    try {
      booking = await Booking.findOne({ id: bookingId });
    } catch {}

    if (!booking) {
      booking = dbStore.getBookings().find((b) => b.id === bookingId);
    }

    if (!booking) {
      const err = new Error('Booking not found');
      err.statusCode = 404;
      throw err;
    }

    if (booking.otp !== inputOtp.trim()) {
      const err = new Error(`Invalid OTP "${inputOtp}". Please enter the correct 4-digit code shown on the rider screen.`);
      err.statusCode = 400;
      throw err;
    }

    booking.otpVerified = true;
    booking.status = 'in_transit';

    try {
      await Booking.findOneAndUpdate(
        { id: bookingId },
        { $set: { otpVerified: true, status: 'in_transit' } }
      );
    } catch {}

    const local = dbStore.getBookings().find((b) => b.id === bookingId);
    if (local) {
      local.otpVerified = true;
      local.status = 'in_transit';
      dbStore.addBooking(local);
    }

    return { success: true, message: 'OTP verified! Trip is now In-Transit.', booking };
  },

  /**
   * Cancel booking with 100% instant refund & carpool seat restoration
   */
  async cancelBooking(bookingId, reason = 'Change of plans') {
    let booking = null;
    try {
      booking = await Booking.findOne({ id: bookingId });
    } catch {}

    if (!booking) {
      booking = dbStore.getBookings().find((b) => b.id === bookingId);
    }

    if (!booking) {
      const err = new Error('Booking not found');
      err.statusCode = 404;
      throw err;
    }

    if (booking.status === 'Cancelled') {
      return { success: true, message: 'Booking is already cancelled', booking, refund: 0 };
    }

    if (booking.otpVerified || booking.status === 'in_transit' || booking.status === 'Completed') {
      const err = new Error('Cannot cancel a trip that has already started or completed.');
      err.statusCode = 400;
      throw err;
    }

    const fare = Number(booking.fare || booking.finalPrice || 0);

    // 1. Process 100% Instant Refund to Wallet
    let refundResult = { refunded: 0 };
    if (fare > 0 && booking.userId) {
      refundResult = await paymentService.refundWallet(booking.userId, fare, `Cancellation refund: ${reason}`);
    }

    // 2. Restore carpool seats if applicable
    if (booking.carpoolId) {
      await carpoolService.restoreSeatAtomic(booking.carpoolId, booking.seats || 1);
    }

    // 3. Mark booking cancelled
    booking.status = 'Cancelled';
    booking.cancelReason = reason;
    booking.cancelledAt = new Date();

    try {
      await Booking.findOneAndUpdate(
        { id: bookingId },
        { $set: { status: 'Cancelled', cancelReason: reason, cancelledAt: new Date() } }
      );
    } catch {}

    const local = dbStore.getBookings().find((b) => b.id === bookingId);
    if (local) {
      local.status = 'Cancelled';
      local.cancelReason = reason;
      local.cancelledAt = new Date();
      dbStore.addBooking(local);
    }

    return {
      success: true,
      message: 'Booking cancelled successfully. 100% refund credited to your wallet.',
      booking,
      refund: fare,
      newWalletBalance: refundResult.newBalance
    };
  },

  /**
   * Get bookings by user ID
   */
  async getUserBookings(userId) {
    let list = [];
    try {
      list = await Booking.find({ userId }).sort({ createdAt: -1 });
    } catch {}

    if (!list || list.length === 0) {
      list = dbStore.getBookings().filter((b) => b.userId === userId);
    }

    return list;
  }
};
