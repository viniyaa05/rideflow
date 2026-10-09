import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER || process.env.GMAIL_USER || 'rideflow2026@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || '';

// Create reusable transporter
let pooledTransporter = null;

const createTransporter = () => {
  if (!EMAIL_PASS) {
    return null;
  }

  if (!pooledTransporter) {
    pooledTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS.replace(/\s+/g, '')
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      socketTimeout: 30000,
      greetingTimeout: 20000
    });
  }

  return pooledTransporter;
};

/**
 * Send Password Reset OTP Email
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.userName - Recipient name
 * @param {string} options.otp - 6-digit verification OTP
 * @returns {Promise<{ sent: boolean, messageId?: string, reason?: string }>}
 */
export const sendPasswordResetEmail = async ({ to, userName, otp }) => {
  if (!to || !to.includes('@')) {
    return { sent: false, reason: 'invalid_email' };
  }

  const transporter = createTransporter();

  if (!transporter) {
    console.warn(
      `[MailService] EMAIL_PASS / GMAIL_APP_PASSWORD is not set in .env. ` +
      `To deliver live emails from ${EMAIL_USER} directly into inboxes, add your 16-character Google App Password in .env.`
    );
    return { 
      sent: false, 
      reason: 'smtp_not_configured', 
      senderEmail: EMAIL_USER 
    };
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 15px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px; }
    .otp-container { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin-bottom: 6px; }
    .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #6d28d9; font-family: 'Courier New', Courier, monospace; margin: 4px 0; }
    .otp-expiry { font-size: 12px; font-weight: 600; color: #dc2626; margin-top: 6px; }
    .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 8px; font-size: 12px; color: #92400e; margin: 20px 0; }
    .footer { padding: 20px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5; }
    .footer a { color: #6d28d9; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>RideFlow Tamil Nadu</h1>
      <p>Secure Transit & Carpool Community</p>
    </div>
    <div class="content">
      <div class="greeting">Hello ${userName || 'RideFlow Member'},</div>
      <p class="text">We received a request to reset the password for your RideFlow account. Use the official 6-digit verification code below to authorize this password change:</p>
      
      <div class="otp-container">
        <div class="otp-label">Password Reset Verification Code</div>
        <div class="otp-code">${otp}</div>
        <div class="otp-expiry">⏱ Valid for 5 minutes only</div>
      </div>

      <div class="warning">
        <strong>Security Notice:</strong> Never share this 6-digit code with anyone, including RideFlow staff. Our team will never ask for your verification code.
      </div>

      <p class="text" style="font-size: 13px; color: #64748b;">
        If you did not request a password reset, you can safely ignore this email. Your current password remains protected and secure.
      </p>
    </div>
    <div class="footer">
      Dispatched by <strong>RideFlow Security Desk</strong><br>
      Official Email: <a href="mailto:${EMAIL_USER}">${EMAIL_USER}</a> • WhatsApp: +91 80728 32066<br>
      Tamil Nadu Multi-Modal Transit Network • All Rights Reserved
    </div>
  </div>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"RideFlow Security Desk" <${EMAIL_USER}>`,
      to,
      subject: `🔐 ${otp} is your RideFlow password reset code`,
      text: `Your RideFlow password reset verification code is: ${otp}. It is valid for 5 minutes. If you did not request this, please ignore.`,
      html: htmlContent
    });

    console.log(`[MailService] Live OTP email dispatched to ${to}! Message ID: ${info.messageId}`);
    return {
      sent: true,
      messageId: info.messageId,
      recipient: to
    };
  } catch (err) {
    console.error(`[MailService Error] Failed to send email to ${to}:`, err.message);
    return {
      sent: false,
      reason: err.message,
      recipient: to
    };
  }
};

/**
 * Send Welcome Email to New Member
 */
export const sendWelcomeEmail = async ({ to, userName }) => {
  if (!to || !to.includes('@')) {
    return { sent: false, reason: 'invalid_email' };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const welcomeHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px; }
    .perks { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 18px 20px; margin: 20px 0; }
    .perk-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #166534; font-weight: 600; margin-bottom: 8px; }
    .perk-item:last-child { margin-bottom: 0; }
    .footer { padding: 20px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5; }
    .footer a { color: #0d9488; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Vanakkam, Welcome to RideFlow! 🚀</h1>
      <p>Tamil Nadu's Multi-Modal Smart Transit Network</p>
    </div>
    <div class="content">
      <div class="greeting">Hello ${userName || 'RideFlow Member'},</div>
      <p class="text">
        Your RideFlow account is active and verified! Your account credentials and preferences have been registered in our database.
      </p>
      <div class="perks">
        <div class="perk-item">✓ Real-time Leaflet GPS telemetry for passenger & driver</div>
        <div class="perk-item">✓ Instant 2-way texting drawer with your assigned captain</div>
        <div class="perk-item">✓ 24-vehicle self-drive fleet & rapid solo bike taxis across Tamil Nadu</div>
        <div class="perk-item">✓ 4-digit Ride Start OTP protection and zero surge price guarantee</div>
      </div>
      <p class="text">
        Whether commuting along the OMR IT corridor, booking a Thar for a weekend trip, or hailing a solo bike taxi, RideFlow has you covered.
      </p>
    </div>
    <div class="footer">
      Dispatched by <strong>RideFlow Member Services</strong><br>
      Official Desk: <a href="mailto:${EMAIL_USER}">${EMAIL_USER}</a> • WhatsApp: +91 80728 32066<br>
      Chennai Central (600003) to Coimbatore (641012)
    </div>
  </div>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"RideFlow Member Services" <${EMAIL_USER}>`,
      to,
      subject: `🎉 Welcome to RideFlow Tamil Nadu, ${userName || 'Member'}!`,
      text: `Vanakkam ${userName || 'Member'}! Welcome to RideFlow Tamil Nadu. Your account is active with real-time GPS tracking and 2-way driver texting.`,
      html: welcomeHtml
    });

    console.log(`[MailService] Welcome email sent to ${to}! Message ID: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.warn(`[MailService] Welcome email to ${to} deferred:`, err.message);
    return { sent: false, reason: err.message };
  }
};

/**
 * Send Booking Confirmation & Billing Email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.userName - Recipient name
 * @param {Object} options.booking - Complete booking object
 */
export const sendBookingConfirmationEmail = async ({ to, userName, booking }) => {
  if (!to || !to.includes('@')) {
    return { sent: false, reason: 'invalid_email' };
  }

  const pickupTimeText = booking.isScheduled 
    ? `Scheduled for ${booking.scheduledDate || 'Upcoming'} at ${booking.scheduledTime || '09:00 AM'}`
    : 'Immediate Dispatch (Booked Now)';

  const vehicleTypeInfo = booking.driverVehicleType 
    ? `Driver arrives with ${booking.driverVehicleType === 'two-wheeler' ? 'Two-Wheeler (Solo Bike Taxi)' : 'Car (AC Cab)'}`
    : (booking.vehicle || booking.title || 'RideFlow Transit');

  const gstAmount = Math.round((Number(booking.finalPrice || booking.fare || 100) * 0.05));
  const baseFare = Number(booking.fare || booking.price || booking.finalPrice || 100);
  const totalAmount = Number(booking.finalPrice || booking.fare || 100);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #0f172a; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 28px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.95; }
    .content { padding: 28px 24px; }
    .status-badge { display: inline-block; background: #dcfce7; color: #166534; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px; }
    .greeting { font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
    .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 18px 0; }
    .summary-row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px dashed #cbd5e1; }
    .summary-row:last-child { border-bottom: none; }
    .summary-label { color: #64748b; font-weight: 600; }
    .summary-val { color: #0f172a; font-weight: 700; text-align: right; }
    .otp-box { background: #fef3c7; border: 2px dashed #f59e0b; border-radius: 14px; padding: 16px; text-align: center; margin: 20px 0; }
    .otp-title { font-size: 11px; font-weight: 800; color: #92400e; text-transform: uppercase; letter-spacing: 1px; }
    .otp-code { font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #b45309; font-family: monospace; margin: 4px 0; }
    .otp-desc { font-size: 12px; color: #78350f; font-weight: 600; }
    .billing-table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 12px; }
    .billing-table th { text-align: left; padding: 8px 10px; background: #f1f5f9; color: #475569; font-weight: 700; }
    .billing-table td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    .billing-total { font-weight: 800; font-size: 14px; color: #0f172a; background: #f8fafc; }
    .safety-notice { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 14px; border-radius: 8px; font-size: 12px; color: #1e40af; margin-top: 20px; }
    .footer { padding: 20px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5; }
    .footer a { color: #0d9488; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Booking Confirmed! 🚗</h1>
      <p>RideFlow India Multi-Modal Transit Network</p>
    </div>
    <div class="content">
      <span class="status-badge">✓ Confirmed & Dispatched</span>
      <div class="greeting">Hello ${userName || 'RideFlow Commuter'},</div>
      <p style="font-size: 13px; color: #475569; line-height: 1.5; margin: 0 0 16px;">
        Thank you for booking with RideFlow. Your transit reservation is confirmed in our real-time network. Below are your ride dispatch details, pick-up timing, and official billing invoice:
      </p>

      <!-- Ride Start OTP -->
      <div class="otp-box">
        <div class="otp-title">4-Digit Ride Start OTP</div>
        <div class="otp-code">${booking.otp || '4892'}</div>
        <div class="otp-desc">Convey this secure PIN to your captain upon arrival to verify and start trip</div>
      </div>

      <!-- Schedule & Pickup Details -->
      <div class="summary-box">
        <div class="summary-row">
          <span class="summary-label">Booking Reference ID:</span>
          <span class="summary-val" style="font-family: monospace; color: #0d9488;">${booking.id}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Service Type:</span>
          <span class="summary-val">${booking.mode || 'Ride with Driver'}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Vehicle / Captain Option:</span>
          <span class="summary-val">${vehicleTypeInfo}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Assigned Captain / Host:</span>
          <span class="summary-val">${booking.assignedDriverName || booking.driverOrHost || 'Verified RideFlow Captain'}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Pickup Timing:</span>
          <span class="summary-val" style="color: #059669;">${pickupTimeText}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Pickup Location:</span>
          <span class="summary-val">${booking.pickupLocation || booking.from || 'Chennai Central Railway Station'}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Drop-off Destination:</span>
          <span class="summary-val">${booking.dropoffLocation || booking.to || 'OMR IT Expressway'}</span>
        </div>
      </div>

      <!-- Billing Summary -->
      <h4 style="margin: 20px 0 8px; font-size: 13px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
        Tax Invoice & Billing Breakdown
      </h4>
      <table class="billing-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: right;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Base Fare & Travel Charges (${booking.title || 'Transit Route'})</td>
            <td style="text-align: right;">₹${baseFare}</td>
          </tr>
          <tr>
            <td>GST (CGST 2.5% + SGST 2.5% - SAC 996412)</td>
            <td style="text-align: right;">₹${gstAmount}</td>
          </tr>
          <tr>
            <td>Safety, GPS Telemetry & SOS Emergency Fee</td>
            <td style="text-align: right;">₹5.00</td>
          </tr>
          ${booking.discount ? `
          <tr style="color: #059669;">
            <td>RideFlow Reward Discount</td>
            <td style="text-align: right;">-₹${booking.discount}</td>
          </tr>` : ''}
          <tr class="billing-total">
            <td style="padding-top: 10px;">Total Paid (${booking.paymentMethodName || 'RideFlow Wallet'})</td>
            <td style="text-align: right; color: #059669; font-size: 15px; padding-top: 10px;">₹${totalAmount}</td>
          </tr>
        </tbody>
      </table>

      <!-- Safety Notice -->
      <div class="safety-notice">
        <strong>🛡️ Commuter Safety Advisory:</strong> Always verify that the driver's vehicle license plate matches before boarding. Use the in-app SOS button or dial 112 for emergency transit assistance.
      </div>
    </div>

    <div class="footer">
      Dispatched automatically by <strong>RideFlow Dispatch Operations</strong><br>
      Support Hotline: +91 80728 32066 • Emergency Police: 112 • Email: <a href="mailto:${EMAIL_USER}">${EMAIL_USER}</a><br>
      GSTIN: 33AAACR4921F1ZX • All India Smart Transit Network
    </div>
  </div>
</body>
</html>
  `;

  const emailPayload = {
    recipient: to,
    subject: `🚗 Booking Confirmed: ${booking.title || booking.mode} [${booking.id}]`,
    sentAt: new Date().toISOString(),
    pickupTimeText,
    totalAmount,
    otp: booking.otp || '4892',
    html: htmlContent
  };

  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[MailService] Live SMTP not configured in .env. Email confirmation simulated for ${to}: "${emailPayload.subject}"`);
    return {
      sent: true,
      simulated: true,
      recipient: to,
      emailPayload
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"RideFlow Bookings Desk" <${EMAIL_USER}>`,
      to,
      subject: emailPayload.subject,
      text: `Your RideFlow booking (${booking.id}) is confirmed! Pickup: ${booking.pickupLocation || booking.from}. Scheduled: ${pickupTimeText}. Your 4-digit Ride Start OTP is ${booking.otp || '4892'}. Total Fare: Rs. ${totalAmount}.`,
      html: htmlContent
    });

    console.log(`[MailService] Live booking confirmation email dispatched to ${to}! Message ID: ${info.messageId}`);
    return {
      sent: true,
      messageId: info.messageId,
      recipient: to,
      emailPayload
    };
  } catch (err) {
    console.warn(`[MailService Error] Email send failed to ${to}:`, err.message);
    return {
      sent: false,
      reason: err.message,
      emailPayload
    };
  }
};


