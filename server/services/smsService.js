import dotenv from 'dotenv';

dotenv.config();

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER || '';
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || '';

/**
 * Format SMS body for RideFlow Tamil Nadu Transit Confirmation
 */
export const formatBookingSmsText = ({ userName, booking }) => {
  const name = userName || 'Commuter';
  const id = booking.id || 'RF-TN-' + Math.floor(100000 + Math.random() * 900000);
  const mode = booking.mode || 'Ride with Driver';
  const pickup = (booking.pickupLocation || booking.from || 'Chennai Central').split('(')[0].trim();
  const drop = (booking.dropoffLocation || booking.to || 'OMR IT Expressway').split('(')[0].trim();
  const otp = booking.otp || '4892';
  const fare = booking.fare || booking.finalPrice || 140;
  const timing = booking.isScheduled ? `${booking.scheduledDate} at ${booking.scheduledTime}` : 'Immediate Dispatch (~3 mins)';
  const captain = booking.assignedDriverName || booking.driverOrHost || 'Vetted Captain';
  const vehicle = booking.driverVehicleType === 'two-wheeler' || booking.mode?.toLowerCase().includes('bike')
    ? 'Bike Taxi (Yamaha MT-15 • TN-09-CB-9988)'
    : 'Sedan (Swift Dzire • TN-09-AB-1234)';

  return `[RideFlow 🚗] Booking Confirmed!
Hi ${name}, your trip ${id} is locked.
• Service: ${mode}
• Vehicle: ${vehicle}
• Captain: ${captain}
• Pickup: ${pickup}
• Destination: ${drop}
• Timing: ${timing}
• Ride Start OTP: ${otp} (Share only with captain)
• Fare: ₹${fare} (${booking.paymentMethod === 'cash' ? 'Pay Cash on Trip' : 'Paid'})
Track Trip: https://rideflow.tn.gov.in/track/${id}
Ride safe with RideFlow Tamil Nadu!`;
};

/**
 * Send Booking Confirmation SMS to Phone
 * @param {Object} options
 * @param {string} options.toPhone - Recipient mobile number (e.g. +91 98401 23456)
 * @param {string} options.userName - Commuter name
 * @param {Object} options.booking - Booking object
 * @returns {Promise<{ sent: boolean, simulated: boolean, recipient: string, smsText: string, messageId: string }>}
 */
export const sendBookingConfirmationSMS = async ({ toPhone, userName, booking }) => {
  const phone = (toPhone || booking.userPhone || '+91 98401 23456').trim();
  const smsText = formatBookingSmsText({ userName, booking });
  const messageId = 'SMS_RF_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  // 1. If Twilio SMS Gateway is configured in .env
  if (TWILIO_SID && TWILIO_AUTH && TWILIO_PHONE) {
    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
      const authHeader = 'Basic ' + Buffer.from(`${TWILIO_SID}:${TWILIO_AUTH}`).toString('base64');
      const bodyParams = new URLSearchParams({
        To: phone,
        From: TWILIO_PHONE,
        Body: smsText
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams.toString()
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`[SmsService] Live SMS dispatched to ${phone} via Twilio! SID: ${data.sid}`);
        return {
          sent: true,
          simulated: false,
          recipient: phone,
          smsText,
          messageId: data.sid
        };
      } else {
        console.warn(`[SmsService] Twilio SMS failed:`, data.message);
      }
    } catch (twErr) {
      console.warn(`[SmsService] Twilio request error:`, twErr.message);
    }
  }

  // 2. If Fast2SMS (Indian Gateway) is configured in .env
  if (FAST2SMS_API_KEY) {
    try {
      const cleanNumber = phone.replace(/[^0-9]/g, '').slice(-10);
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'v3',
          sender_id: 'TXTIND',
          message: smsText,
          language: 'english',
          flash: 0,
          numbers: cleanNumber
        })
      });
      const data = await res.json();
      if (data.return) {
        console.log(`[SmsService] Live SMS dispatched to ${phone} via Fast2SMS!`);
        return {
          sent: true,
          simulated: false,
          recipient: phone,
          smsText,
          messageId: data.request_id || messageId
        };
      }
    } catch (fErr) {
      console.warn(`[SmsService] Fast2SMS error:`, fErr.message);
    }
  }

  // 3. Fallback / Local simulation with formatted payload
  console.log(`\n=============================================================`);
  console.log(`[SmsService] 📱 SMS DISPATCH TO MOBILE: ${phone}`);
  console.log(`[SmsService] MESSAGE ID: ${messageId}`);
  console.log(`-------------------------------------------------------------`);
  console.log(smsText);
  console.log(`=============================================================\n`);

  return {
    sent: true,
    simulated: true,
    recipient: phone,
    smsText,
    messageId
  };
};
