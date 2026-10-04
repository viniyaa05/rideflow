import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Wallet, 
  ShieldCheck, 
  RotateCcw, 
  Clock, 
  MapPin, 
  ArrowRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CancelModal({ booking, onClose, onCancelled }) {
  const { cancelBooking } = useAuth();
  const [selectedReason, setSelectedReason] = useState('Change of travel plans');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [refundInfo, setRefundInfo] = useState(null);

  if (!booking) return null;

  const reasons = [
    'Change of travel plans',
    'Driver/Host taking too long to arrive',
    'Found alternative transit / carpool',
    'Booked by mistake / wrong route',
    'Other reason'
  ];

  const handleConfirmCancel = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = cancelBooking(booking.id, selectedReason);
    setRefundInfo(result);
    setIsProcessing(false);
    setIsSuccess(true);

    if (onCancelled) {
      onCancelled(booking.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl relative">
        
        {!isSuccess ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cancel Your Booking</h3>
                  <p className="text-xs text-slate-500 font-medium">Reference: {booking.id}</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Trip Details Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{booking.title || booking.mode}</span>
                <span className="text-xs font-extrabold text-slate-900 departure-digit">₹{booking.fare}</span>
              </div>
              <p className="text-xs text-slate-600">{booking.driverOrHost || `${booking.from} ➔ ${booking.to}`}</p>
            </div>

            {/* 100% Instant Refund Notice */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900">100% Free Cancellation Policy</p>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  A full refund of <strong className="departure-digit">₹{booking.fare}</strong> will be instantly credited to your <strong>RideFlow Wallet</strong>.
                </p>
              </div>
            </div>

            {/* Cancellation Reason Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Please select a reason for cancellation:</label>
              <div className="space-y-1.5">
                {reasons.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedReason === reason
                        ? 'bg-red-50/60 border-red-300 text-slate-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="text-red-600 focus:ring-red-500 accent-red-600"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isProcessing}
                className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                {isProcessing ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Confirm & Cancel</span>
                    <RotateCcw className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

          </div>
        ) : (
          /* Cancellation Confirmation Receipt View */
          <div className="text-center py-4 space-y-5 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase text-red-600 tracking-wider">
                Booking Cancelled
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">Trip Cancelled Successfully</h3>
              <p className="text-xs text-slate-500">
                Booking Reference: <span className="font-mono text-slate-800 font-bold">{booking.id}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Refund Amount:</span>
                <span className="font-extrabold text-emerald-700 departure-digit text-sm">₹{booking.fare}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Refund Destination:</span>
                <span className="font-bold text-slate-800">RideFlow Wallet (Instant)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Reason Logged:</span>
                <span className="font-semibold text-slate-700">{selectedReason}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
