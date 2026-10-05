import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER || process.env.GMAIL_USER || 'rideflow2026@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || '';

// Create reusable transporter
const createTransporter = () => {
  if (!EMAIL_PASS) {
    return null;
  }

  // Gmail SMTP
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS.replace(/\s+/g, '') // strip any spaces if user copied with spaces
    }
  });
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
