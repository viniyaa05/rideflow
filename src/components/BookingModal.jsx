import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  Wallet, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  MapPin, 
  Receipt,
  Download,
  Building2,
  Banknote,
  Smartphone,
  ChevronRight,
  AlertCircle,
  Star,
  MessageSquare,
  Radio,
  UserCheck,
  Bike,
  Car,
  Key
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { downloadTripReceipt } from '../utils/pdfReceipt';
import ReviewModal from './ReviewModal';

const TARGET_TYPE_BY_MODE = {
  'Book a Driver': 'driver',
  'Private Chauffeur': 'driver',
  'Solo Bike Taxi': 'driver',
  'Self-Drive Rental': 'rental',
  'Carpool Connect': 'carpool'
};

export default function BookingModal({ bookingItem, onClose, onBookingSuccess }) {
  const { user, addBooking, addWalletFunds, reviews } = useAuth();
  const { currentThemeMeta } = useTheme();
  const { t, currentLang } = useLanguage();
  
  const [showRatePrompt, setShowRatePrompt] = useState(false);
  
  // Payment Options: 'wallet' | 'upi' | 'card' | 'netbanking' | 'cash'
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  
  // Payment Form Fields
  const [upiId, setUpiId] = useState('alex.chen@okhdfcbank');
  const [isUpiVerified, setIsUpiVerified] = useState(true);
  
  const [cardNumber, setCardNumber] = useState('4532 8921 4421 9081');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Alex Chen');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('742');

  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [usePoints, setUsePoints] = useState(false);
  
  // Dispatch Stages: 'idle' | 'dispatching_1' | 'rejected_1' | 'dispatching_2' | 'confirmed'
  const [dispatchStage, setDispatchStage] = useState('idle');
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const isDriverOrBikeTaxi = Boolean(
    bookingItem?.mode?.toLowerCase().includes('driver') ||
    bookingItem?.mode?.toLowerCase().includes('taxi') ||
    bookingItem?.mode?.toLowerCase().includes('chauffeur') ||
    bookingItem?.mode?.toLowerCase().includes('bike')
  );

  // Reviews relevant to what's being booked
  const relevantReviews = useMemo(() => {
    if (!bookingItem || !reviews) return [];
    const targetType = TARGET_TYPE_BY_MODE[bookingItem.mode];
    const needle = (bookingItem.hostName || bookingItem.title || '').toLowerCase();
    return reviews
      .filter((r) => {
        const typeMatches = !targetType || r.targetType === targetType;
        const nameMatches = needle && (
          needle.includes(r.targetName?.toLowerCase() || '__none__') ||
          (r.targetName?.toLowerCase() || '').includes(needle) ||
          (bookingItem.title || '').toLowerCase().includes(r.targetName?.toLowerCase() || '__none__')
        );
        return typeMatches && nameMatches;
      })
      .slice(0, 3);
  }, [bookingItem, reviews]);

  if (!bookingItem) return null;

  const basePrice = Number(bookingItem.price || 350);
  const discount = usePoints ? Math.min(basePrice, 50.00) : 0;
  const finalPrice = Math.max(0, basePrice - discount);

  const walletBalance = user?.walletBalance || 0;
  const isWalletInsufficient = paymentMethod === 'wallet' && walletBalance < finalPrice;

  const paymentMethodLabels = {
    wallet: 'RideFlow Wallet (Instant)',
    upi: `UPI (${upiId})`,
    card: `Card •••• ${cardNumber.slice(-4)}`,
    netbanking: `Net Banking (${selectedBank})`,
    cash: 'Cash / Pay on Pickup'
  };

  const finalizeBooking = (driverInfo = null) => {
    const generatedId = 'RF-TN-' + Math.floor(100000 + Math.random() * 900000);
    const rideOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(rideOtp);

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 }
    });

    const bookingPayload = {
      id: generatedId,
      ...bookingItem,
      driverOrHost: driverInfo ? `${driverInfo.name} (${driverInfo.vehiclePlate || driverInfo.vehicleModel})` : bookingItem.details,
      assignedDriverName: driverInfo?.name || bookingItem.hostName,
      driverPhone: driverInfo?.phone || '+91 98401 23456',
      finalPrice,
      discount,
      otp: rideOtp,
      paymentMethod,
      paymentMethodName: paymentMethodLabels[paymentMethod],
      savings: discount + 120.00
    };

    const newBookingObj = addBooking(bookingPayload);
    setConfirmedBooking(newBookingObj);
    setDispatchStage('confirmed');

    if (onBookingSuccess) {
      onBookingSuccess(newBookingObj);
    }
  };

  const handleConfirmBooking = async () => {
    if (isWalletInsufficient) {
      alert('Insufficient wallet balance. Please select UPI, Card, or top-up your wallet.');
      return;
    }

    if (isDriverOrBikeTaxi) {
      // Cascading Driver Dispatch Sequence: Driver 1 -> Auto-Cascade -> Driver 2
      setDispatchStage('dispatching_1');
      
      setTimeout(() => {
        // Driver 1 busy/rejected simulation
        setDispatchStage('rejected_1');
        
        setTimeout(() => {
          // Cascade to Driver 2
          setDispatchStage('dispatching_2');
          
          setTimeout(() => {
            const captain2 = {
              name: 'Alex Chen',
              phone: '+91 98401 23456',
              vehicleModel: bookingItem.mode.includes('Bike') ? 'Royal Enfield Hunter 350' : 'Toyota Innova Crysta XL',
              vehiclePlate: 'TN-07-DE-4892',
              rating: 4.95,
              etaMins: 3
            };
            setAssignedDriver(captain2);
            finalizeBooking(captain2);
          }, 1400);
        }, 1200);
      }, 1600);
    } else {
      setDispatchStage('processing');
      setTimeout(() => {
        finalizeBooking();
      }, 600);
    }
  };

  const handleDownloadPDF = () => {
    if (confirmedBooking) {
      downloadTripReceipt(confirmedBooking, user);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* =========================================================================
            1. INITIAL REVIEW & CONFIRMATION VIEW
            ========================================================================= */}
        {dispatchStage === 'idle' && (
          <div className="space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Review & Confirm Booking</h3>
                  <p className="text-xs text-purple-600 font-extrabold">{bookingItem.mode}</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Trip Details Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{bookingItem.title}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Instant Match
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{bookingItem.details}</p>
              
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>Passenger:</span>
                <span className="font-bold text-slate-900">{user?.name || 'RideFlow Commuter'}</span>
              </div>
            </div>

            {/* Reviews for this listing */}
            {relevantReviews.length > 0 ? (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>What riders are saying</span>
                </div>
                <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
                  {relevantReviews.map((rev) => (
                    <div key={rev.id} className="pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-800">{rev.userName}</span>
                        <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-amber-600">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          {rev.rating}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5 line-clamp-2">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <p className="text-[11px] text-slate-500 font-semibold">
                  Verified RideFlow Captain / Partner with clean safety record.
                </p>
              </div>
            )}

            {/* Free Cancellation Notice */}
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="text-[11px] text-emerald-900 font-semibold">
                100% Free Cancellation: Full instant refund credited to your wallet before boarding.
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Choose Payment Method</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {/* 1. Wallet */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'wallet'
                      ? 'bg-purple-50 border-purple-400 text-purple-900 ring-2 ring-purple-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Wallet className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold">Wallet</span>
                  </div>
                  <p className="text-[10px] text-purple-700 font-bold">Bal: ₹{walletBalance}</p>
                </button>

                {/* 2. UPI */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold">UPI / QR</span>
                  </div>
                  <p className="text-[10px] text-slate-500">GPay, PhonePe</p>
                </button>

                {/* 3. Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold">Cards</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Debit / Credit</p>
                </button>

                {/* 4. Net Banking */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'netbanking'
                      ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold">Net Banking</span>
                  </div>
                  <p className="text-[10px] text-slate-500">All Indian Banks</p>
                </button>

                {/* 5. Cash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'bg-teal-50 border-teal-400 text-teal-900 ring-2 ring-teal-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Banknote className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold">Cash</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Pay on Pickup</p>
                </button>
              </div>

              {/* Dynamic Sub-form per payment method */}
              {paymentMethod === 'wallet' && (
                <div className={`p-3 rounded-xl border text-xs ${isWalletInsufficient ? 'bg-red-50 border-red-200' : 'bg-purple-50/60 border-purple-200'}`}>
                  {isWalletInsufficient ? (
                    <div className="flex items-center justify-between text-red-700">
                      <span className="flex items-center gap-1.5 font-bold">
                        <AlertCircle className="w-4 h-4" />
                        Insufficient balance (₹{walletBalance} &lt; ₹{finalPrice})
                      </span>
                      <button
                        type="button"
                        onClick={() => addWalletFunds(500)}
                        className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        + Top-Up ₹500
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-purple-900 font-bold">
                      <span>Remaining balance after trip:</span>
                      <span className="departure-digit text-sm">₹{walletBalance - finalPrice}</span>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <label className="block font-bold text-slate-700">Enter Virtual Payment Address (UPI ID):</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. user@okhdfcbank"
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => setIsUpiVerified(true)}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Loyalty Points Redemption Toggle */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Redeem Reward Points</p>
                  <p className="text-[10px] text-amber-800 font-medium">Save ₹50.00 off this booking</p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={usePoints}
                onChange={(e) => setUsePoints(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Price Summary */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs font-medium">
              <div className="flex justify-between text-slate-500">
                <span>Base Trip Price</span>
                <span className="text-slate-900 font-bold departure-digit">₹{basePrice}</span>
              </div>
              {usePoints && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Reward Points Discount</span>
                  <span className="departure-digit">-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Payable</span>
                <span className="text-emerald-700 departure-digit text-base">₹{finalPrice}</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleConfirmBooking}
              disabled={isWalletInsufficient}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Confirm & Book Ride (₹{finalPrice})</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

          </div>
        )}

        {/* =========================================================================
            2. CASCADING DRIVER DISPATCH SIMULATION
            ========================================================================= */}
        {(dispatchStage === 'dispatching_1' || dispatchStage === 'rejected_1' || dispatchStage === 'dispatching_2' || dispatchStage === 'processing') && (
          <div className="text-center py-8 space-y-6 animate-fade-in">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-purple-700 shadow-inner">
                {dispatchStage === 'dispatching_2' ? (
                  <UserCheck className="w-8 h-8 text-purple-600 animate-pulse" />
                ) : (
                  <Radio className="w-8 h-8 text-purple-600 animate-pulse" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-purple-600 tracking-wider">
                {dispatchStage === 'dispatching_1' && 'Contacting Captain 1 (Karthik Raja)...'}
                {dispatchStage === 'rejected_1' && 'Captain 1 Occupied • Cascading...'}
                {dispatchStage === 'dispatching_2' && 'Auto-Routing to Captain 2 (Alex Chen)...'}
                {dispatchStage === 'processing' && 'Confirming Booking with System...'}
              </span>
              
              <h3 className="text-lg font-extrabold text-slate-900">
                {dispatchStage === 'dispatching_1' && 'Dispatching Ride to Closest Captain in Corridor'}
                {dispatchStage === 'rejected_1' && 'Driver 1 is on another duty. Cascading immediately!'}
                {dispatchStage === 'dispatching_2' && 'Captain 2 is accepting your pickup route...'}
                {dispatchStage === 'processing' && 'Processing your reservation...'}
              </h3>

              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                {dispatchStage === 'rejected_1' 
                  ? 'RideFlow automatically reroutes to the next top-rated driver in the area.'
                  : 'Matching certified drivers with verified helmets and real-time GPS.'}
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            3. CONFIRMED RIDE RECEIPT WITH OTP & DRIVER DETAILS
            ========================================================================= */}
        {dispatchStage === 'confirmed' && (
          <div className="text-center py-2 space-y-5 animate-scale-in">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase text-emerald-700 tracking-wider">
                Booking Confirmed & Saved in MongoDB!
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">Captain Accepted Your Ride</h3>
              <p className="text-xs text-slate-500">
                Booking ID: <span className="font-mono text-emerald-700 font-bold">{confirmedBooking?.id}</span>
              </p>
            </div>

            {/* 4-Digit Ride Start OTP Banner */}
            {generatedOtp && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white space-y-1 shadow-md">
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-purple-200">
                  4-Digit Ride Start OTP (Share with Captain)
                </span>
                <p className="text-3xl font-mono font-black tracking-widest text-emerald-400">
                  {generatedOtp}
                </p>
                <p className="text-[11px] text-purple-200">
                  Captain will verify this code before starting your journey.
                </p>
              </div>
            )}

            {/* Assigned Driver / Host Details */}
            {assignedDriver && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left flex items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-purple-600" />
                    <span>Captain {assignedDriver.name}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {assignedDriver.vehicleModel} • <strong className="text-slate-800">{assignedDriver.vehiclePlate}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold block">
                    ETA: {assignedDriver.etaMins} mins
                  </span>
                  <span className="text-[10px] text-slate-500">Rating: ⭐ {assignedDriver.rating}</span>
                </div>
              </div>
            )}

            {/* Trip Details summary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Mode:</span>
                <span className="font-bold text-slate-900">{confirmedBooking?.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Trip:</span>
                <span className="font-bold text-slate-800">{confirmedBooking?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Payment:</span>
                <span className="font-bold text-purple-700">{confirmedBooking?.paymentMethodName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Total Paid:</span>
                <span className="font-extrabold text-emerald-700 departure-digit text-sm">₹{finalPrice}</span>
              </div>
            </div>

            {/* Action Buttons: PDF Download + Rate + Return */}
            <div className="space-y-2">
              <button
                onClick={handleDownloadPDF}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Official PDF Tax Invoice</span>
              </button>

              <button
                onClick={() => setShowRatePrompt(true)}
                className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>Rate This Ride</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>

      {showRatePrompt && (
        <ReviewModal
          targetItem={{
            targetType: TARGET_TYPE_BY_MODE[bookingItem.mode] || 'driver',
            targetName: assignedDriver?.name || bookingItem.hostName || bookingItem.title,
            targetModel: bookingItem.title
          }}
          onClose={() => setShowRatePrompt(false)}
        />
      )}
    </div>
  );
}
