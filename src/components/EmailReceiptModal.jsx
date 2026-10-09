import React from 'react';
import { 
  X, 
  Mail, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Receipt, 
  Download, 
  Printer, 
  Key, 
  Car,
  AlertTriangle,
  Send
} from 'lucide-react';

export default function EmailReceiptModal({ booking, user, onClose }) {
  if (!booking) return null;

  const userEmail = booking.userEmail || booking.emailReceipt?.recipient || user?.email || 'alex.chen@gmail.com';
  const userName = booking.userName || user?.name || 'RideFlow Commuter';
  const pickupTimeText = booking.isScheduled 
    ? `Scheduled for ${booking.scheduledDate || 'Upcoming'} at ${booking.scheduledTime || '09:00 AM'}`
    : 'Immediate Dispatch (Booked Now)';

  const gstAmount = Math.round((Number(booking.finalPrice || booking.fare || 100) * 0.05));
  const baseFare = Number(booking.fare || booking.price || booking.finalPrice || 100);
  const totalAmount = Number(booking.finalPrice || booking.fare || 100);

  const vehicleTypeInfo = booking.driverVehicleType === 'two-wheeler'
    ? 'Two-Wheeler (Solo Bike Taxi with Helmet)'
    : booking.driverVehicleType === 'car'
    ? 'Car (AC Prime / Hatchback)'
    : (booking.vehicle || booking.title || 'RideFlow Transit');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                Dispatched Email Confirmation Receipt
              </h3>
              <p className="text-[11px] text-emerald-100 font-mono">
                Delivered to: <strong>{userEmail}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Email Document Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
          
          {/* Dispatch Notice Badge */}
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-extrabold text-[11px]">
                Email sent to {userEmail} on {new Date(booking.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
              INBOX VERIFIED
            </span>
          </div>

          {/* Ride Start OTP Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 text-center space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-amber-800">
              4-Digit Ride Start OTP
            </span>
            <div className="font-mono text-3xl font-black text-amber-600 tracking-widest">
              {booking.otp || booking.rideOtp || '4892'}
            </div>
            <p className="text-[11px] text-amber-900 font-semibold">
              Share with Captain upon arrival before trip starts
            </p>
          </div>

          {/* Trip & Schedule Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Booking ID:</span>
              <span className="font-mono font-bold text-slate-900">{booking.id}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Service Mode:</span>
              <span className="font-bold text-slate-900">{booking.mode}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Vehicle Option:</span>
              <span className="font-bold text-slate-900">{vehicleTypeInfo}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Assigned Captain:</span>
              <span className="font-bold text-slate-900">{booking.assignedDriverName || booking.driverOrHost || 'RideFlow Captain'}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Pick-up Timing:</span>
              <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                {pickupTimeText}
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Pickup:</strong> {booking.pickupLocation || booking.from}
                </span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Drop:</strong> {booking.dropoffLocation || booking.to}
                </span>
              </div>
            </div>
          </div>

          {/* Billing Breakdown Table */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Tax Invoice & Billing Breakdown
            </h4>

            <div className="border border-slate-200 rounded-2xl overflow-hidden font-mono text-[11px]">
              <div className="flex justify-between p-2.5 bg-slate-50 border-b border-slate-200 font-sans font-bold text-slate-600">
                <span>Description</span>
                <span>Amount (INR)</span>
              </div>

              <div className="flex justify-between p-2.5 border-b border-slate-100 text-slate-700">
                <span>Base Fare ({booking.title || 'Trip'})</span>
                <span>₹{baseFare}</span>
              </div>

              <div className="flex justify-between p-2.5 border-b border-slate-100 text-slate-700">
                <span>GST (CGST 2.5% + SGST 2.5% - SAC 996412)</span>
                <span>₹{gstAmount}</span>
              </div>

              <div className="flex justify-between p-2.5 border-b border-slate-100 text-slate-700">
                <span>Platform Safety & SOS Emergency Fee</span>
                <span>₹5.00</span>
              </div>

              {booking.discount > 0 && (
                <div className="flex justify-between p-2.5 border-b border-slate-100 text-emerald-700 font-bold">
                  <span>Loyalty / Promotional Discount</span>
                  <span>-₹{booking.discount}</span>
                </div>
              )}

              <div className="flex justify-between p-3 bg-slate-50 font-bold text-slate-900 text-xs">
                <span>Total Paid ({booking.paymentMethodName || 'RideFlow Wallet'})</span>
                <span className="text-emerald-700 text-sm">₹{totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] space-y-1">
            <p className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>RideFlow Safety & Support Guarantee</span>
            </p>
            <p className="text-blue-800 text-[10px]">
              Official invoice registered under GSTIN: 33AAACR4921F1ZX. Need emergency transit help? Tap in-app SOS or dial 112.
            </p>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <span className="text-[10px] text-slate-500 font-medium">
            Subject: 🚗 Booking Confirmed [{booking.id}]
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Close Receipt
          </button>
        </div>

      </div>
    </div>
  );
}
