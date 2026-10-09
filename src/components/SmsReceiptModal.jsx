import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  CheckCheck, 
  Smartphone, 
  Copy, 
  Check, 
  RotateCw, 
  ShieldCheck, 
  ExternalLink,
  Phone,
  Clock,
  Sparkles
} from 'lucide-react';

export default function SmsReceiptModal({ booking, user, onClose }) {
  const [copied, setCopied] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  if (!booking) return null;

  const userPhone = booking.userPhone || booking.riderPhone || booking.smsReceipt?.recipient || user?.phone || '+91 98401 23456';
  const userName = booking.riderName || booking.userName || user?.name || 'RideFlow Commuter';
  const bookingId = booking.id || 'RF-TN-849201';
  const mode = booking.mode || 'Ride with Driver';
  const pickup = (booking.pickupLocation || booking.from || 'Chennai Central').split('(')[0].trim();
  const drop = (booking.dropoffLocation || booking.to || 'OMR IT Expressway').split('(')[0].trim();
  const otp = booking.otp || booking.rideOtp || '4892';
  const fare = booking.finalPrice || booking.fare || booking.price || 140;
  const timing = booking.isScheduled ? `${booking.scheduledDate} at ${booking.scheduledTime}` : 'Immediate Dispatch (~3 mins)';
  const captain = booking.assignedDriverName || booking.driverOrHost || 'Rajesh Kumar';
  const vehicle = booking.driverVehicleType === 'two-wheeler' || booking.mode?.toLowerCase().includes('bike')
    ? 'Bike Taxi (Royal Enfield Hunter • TN-07-DE-4892)'
    : 'Sedan (Swift Dzire AC • TN-09-EV-8821)';

  // Exact SMS text delivered to the SIM card
  const smsText = booking.smsReceipt?.smsText || `[RideFlow 🚗] Booking Confirmed!
Hi ${userName}, your trip ${bookingId} is locked.
• Service: ${mode}
• Vehicle: ${vehicle}
• Captain: ${captain}
• Pickup: ${pickup}
• Destination: ${drop}
• Timing: ${timing}
• Ride Start OTP: ${otp} (Share only with captain)
• Fare: ₹${fare} (${booking.paymentMethod === 'cash' ? 'Pay Cash on Trip' : 'Paid'})
Track Trip: https://rideflow.tn.gov.in/track/${bookingId}
Ride safe with RideFlow Tamil Nadu!`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(smsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResend = () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Mobile App Style Top Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                  Mobile Phone SMS Receipt
                </h3>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 text-[9px] font-black uppercase">
                  Delivered
                </span>
              </div>
              <p className="text-[11px] text-blue-100 font-mono flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 inline" />
                <span>SMS Sent to: <strong>{userPhone}</strong></span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area Styled as Mobile Messaging App */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-100 text-slate-800 text-xs">
          
          {/* Carrier & Gateway Info Badge */}
          <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between text-slate-600 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-800">TRAI DLT Verified Gateway</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
              Header: VK-RDFLOW
            </span>
          </div>

          {/* Phone SMS Conversation Bubble Mockup */}
          <div className="space-y-2">
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-200/60 px-2.5 py-0.5 rounded-full">
                Today • Just Now
              </span>
            </div>

            <div className="bg-white rounded-2xl rounded-tl-xs p-4 border border-slate-200 shadow-xs space-y-3 relative group">
              {/* Message Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-blue-700 font-black text-xs">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>RIDEFLOW TRANSIT</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Delivered to SIM</span>
                </div>
              </div>

              {/* Formatted SMS Body */}
              <div className="whitespace-pre-line font-mono text-[11px] leading-relaxed text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 select-all">
                {smsText}
              </div>

              {/* Ride Start OTP Quick Highlight */}
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Ride Start OTP</span>
                  <span className="font-mono text-base font-black text-amber-700 tracking-wider">{otp}</span>
                </div>
                <span className="text-[10px] text-amber-900 font-medium max-w-[170px] text-right">
                  Give to captain on arrival
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-extrabold">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy SMS Text</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={resending}
              onClick={handleResend}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>{resending ? 'Sending...' : 'Resend SMS'}</span>
            </button>
          </div>

          {resendSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold text-center animate-fade-in">
              ✓ SMS re-dispatched to {userPhone} successfully!
            </div>
          )}

          {/* DLT & Privacy compliance disclaimer */}
          <div className="p-3 rounded-2xl bg-white/70 border border-slate-200 text-slate-500 text-[10px] space-y-1">
            <div className="flex items-center gap-1 font-bold text-slate-700">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Simulated & Real Gateway Ready</span>
            </div>
            <p>
              Both Email and SMS messages are automatically dispatched upon every booking. The commuter receives OTP, captain contact, vehicle details, and live tracking links via mobile SMS.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all cursor-pointer shadow-xs"
          >
            Close SMS Receipt
          </button>
        </div>

      </div>
    </div>
  );
}
