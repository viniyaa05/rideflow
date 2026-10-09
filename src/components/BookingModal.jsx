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
  Radio,
  UserCheck,
  Bike,
  Car,
  Key,
  Calendar,
  AlertTriangle,
  Mail,
  Share2,
  ShieldAlert,
  Users,
  User,
  QrCode,
  Tag,
  Phone,
  Wind,
  Check,
  CalendarDays,
  RefreshCw,
  Copy,
  Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { downloadTripReceipt } from '../utils/pdfReceipt';
import ReviewModal from './ReviewModal';
import EmailReceiptModal from './EmailReceiptModal';
import SmsReceiptModal from './SmsReceiptModal';
import LocationAutocomplete from './LocationAutocomplete';

const TARGET_TYPE_BY_MODE = {
  'Book a Driver': 'driver',
  'Private Chauffeur': 'driver',
  'Solo Bike Taxi': 'driver',
  'Ride with Driver': 'driver',
  'Self-Drive Rental': 'rental',
  'Carpool Connect': 'carpool'
};

const TIME_SLOTS = [
  '06:30 AM', '08:00 AM', '09:30 AM', '11:00 AM', 
  '12:30 PM', '02:00 PM', '03:30 PM', '05:00 PM', 
  '06:30 PM', '08:00 PM', '09:30 PM', '11:00 PM'
];

export default function BookingModal({ bookingItem, onClose, onBookingSuccess }) {
  const { user, addBooking, addWalletFunds, reviews, bookings } = useAuth();
  const { currentThemeMeta } = useTheme();
  const { t, currentLang } = useLanguage();

  // Load Razorpay Checkout SDK dynamically
  useEffect(() => {
    if (!document.getElementById('razorpay-checkout-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);
  
  // Timing Mode: 'now' (Immediate Dispatch) | 'schedule' (Date & Timing selection)
  const isDefaultSchedule = Boolean(
    bookingItem?.isScheduled || 
    bookingItem?.mode?.toLowerCase().includes('rental') ||
    bookingItem?.mode?.toLowerCase().includes('fleet')
  );

  const [timingMode, setTimingMode] = useState(isDefaultSchedule ? 'schedule' : 'now');
  
  // Schedule parameters (supports manual typing)
  const todayStr = new Date().toISOString().split('T')[0];
  const [scheduledDate, setScheduledDate] = useState(todayStr);
  const [scheduledTime, setScheduledTime] = useState('09:30 AM');
  const [rentalHours, setRentalHours] = useState(bookingItem?.durationHours || 8);

  // Service mode identification
  const isDriverService = Boolean(
    bookingItem?.mode?.toLowerCase().includes('driver') ||
    bookingItem?.mode?.toLowerCase().includes('chauffeur') ||
    bookingItem?.mode?.toLowerCase().includes('ride')
  );

  const isRentalService = Boolean(
    bookingItem?.mode?.toLowerCase().includes('rental') ||
    bookingItem?.targetType === 'rental'
  );

  const isBikeItem = Boolean(
    bookingItem?.vehicleType?.toLowerCase() === 'bike' ||
    bookingItem?.category?.toLowerCase()?.includes('bike') ||
    bookingItem?.mode?.toLowerCase().includes('bike') ||
    bookingItem?.vehicle?.toLowerCase()?.includes('bike') ||
    bookingItem?.vehicle?.toLowerCase()?.includes('scooter') ||
    bookingItem?.vehicle?.toLowerCase()?.includes('jupiter') ||
    bookingItem?.vehicle?.toLowerCase()?.includes('classic') ||
    bookingItem?.vehicle?.toLowerCase()?.includes('aerox') ||
    bookingItem?.vehicle?.toLowerCase()?.includes('ola')
  );

  const [driverVehicleType, setDriverVehicleType] = useState(() => {
    if (bookingItem?.driverVehicleType) return bookingItem.driverVehicleType;
    if (isBikeItem) return 'two-wheeler';
    return 'car';
  });

  const isTwoWheeler = isDriverService ? (driverVehicleType === 'two-wheeler') : isBikeItem;

  // 1. Choose a Rider (Me vs Order for Someone Else / Guest)
  const [riderChoice, setRiderChoice] = useState('me'); // 'me' | 'guest'
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // 2. Number of Passengers (For Cab and Rental Car)
  const [passengerCount, setPassengerCount] = useState(1);

  // 3. AC vs Non-AC for Car
  const [acPreference, setAcPreference] = useState('ac'); // 'ac' | 'non-ac'

  // 4. Pickup (From) & Drop (To) with Live Geocoding API
  const [pickupLocation, setPickupLocation] = useState(
    bookingItem?.from || bookingItem?.location || 'Chennai Central Railway Station'
  );
  const [dropLocation, setDropLocation] = useState(
    bookingItem?.to || 'OMR IT Expressway, Sholinganallur'
  );

  // 5. Promo Code (50% OFF First Ride: FIRST50)
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isFirst50Applied, setIsFirst50Applied] = useState(false);
  const [promoMessage, setPromoMessage] = useState('');

  // 6. Payment Modes: 'razorpay' | 'upi' | 'card' | 'wallet' | 'cash'
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [upiId, setUpiId] = useState('alex.chen@okhdfcbank');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [upiVerificationMsg, setUpiVerificationMsg] = useState('');
  const [qrGeneratedAt, setQrGeneratedAt] = useState(Date.now());
  const [qrCountdown, setQrCountdown] = useState(300); // 5 mins countdown
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState('4532 8921 4421 9081');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('892');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Alex Chen');

  const [usePoints, setUsePoints] = useState(false);
  const [isRazorpayProcessing, setIsRazorpayProcessing] = useState(false);
  
  // Modals & Extras
  const [commuterPhone, setCommuterPhone] = useState(user?.phone || '+91 98401 23456');
  const [showRatePrompt, setShowRatePrompt] = useState(false);
  const [showEmailReceiptModal, setShowEmailReceiptModal] = useState(false);
  const [showSmsReceiptModal, setShowSmsReceiptModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  
  // Dispatch Stages: 'idle' | 'dispatching_1' | 'rejected_1' | 'dispatching_2' | 'processing' | 'confirmed'
  const [dispatchStage, setDispatchStage] = useState('idle');
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // QR countdown timer
  useEffect(() => {
    if (paymentMethod === 'upi') {
      const timer = setInterval(() => {
        setQrCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [paymentMethod, qrGeneratedAt]);

  if (!bookingItem) return null;

  // Calculate pricing based on vehicle choice, duration, and AC preference
  const basePrice = useMemo(() => {
    let price = Number(bookingItem.price || 350);
    // If user switched to two-wheeler on ride with driver, apply 45% economy rate like Rapido
    if (isDriverService && isTwoWheeler && !bookingItem.mode?.toLowerCase().includes('bike')) {
      price = Math.round(price * 0.45);
    }
    // If rental fleet, adjust based on rentalHours
    if (bookingItem.mode?.toLowerCase().includes('rental') || bookingItem.hourlyPrice) {
      const hourly = Number(bookingItem.hourlyPrice || bookingItem.pricePerHour || 150);
      price = Math.round(hourly * (rentalHours / 4) * 3.5);
    }
    // AC vs Non-AC for Car: Non-AC saves ₹30
    if (!isTwoWheeler && acPreference === 'non-ac') {
      price = Math.max(40, price - 30);
    }
    return Math.max(price, 40);
  }, [bookingItem, isTwoWheeler, rentalHours, isDriverService, acPreference]);

  // Discounts: FIRST50 (50% off) + Reward Points
  const first50Discount = isFirst50Applied ? Math.round(basePrice * 0.5) : 0;
  const rewardDiscount = usePoints ? Math.min(basePrice - first50Discount, 50.00) : 0;
  const totalDiscount = first50Discount + rewardDiscount;
  const finalPrice = Math.max(0, basePrice - totalDiscount);

  const walletBalance = user?.walletBalance || 0;
  const isWalletInsufficient = paymentMethod === 'wallet' && walletBalance < finalPrice;

  // Dynamic Razorpay & UPI QR Payload
  const upiPayload = `upi://pay?pa=rideflow.mobility@razorpay&pn=RideFlow%20Mobility%20Technologies&am=${finalPrice}&cu=INR&tn=RideFlow%20Trip%20Booking%20${scheduledDate}`;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(upiPayload)}`;

  const paymentMethodLabels = {
    razorpay: 'Razorpay Secured Gateway',
    upi: `UPI Dynamic QR (${upiId})`,
    card: `Credit/Debit Card (•••• ${cardNumber.slice(-4)})`,
    wallet: 'RideFlow Wallet (Instant)',
    cash: 'Cash / Pay on Trip Completion'
  };

  // Anti-conflict checking: check if the selected vehicle/driver is already booked
  const conflictingBooking = useMemo(() => {
    if (!bookings || bookings.length === 0) return null;
    const targetKey = (bookingItem.id || bookingItem.title || bookingItem.name || '').toLowerCase();
    
    return bookings.find((b) => {
      if (b.status === 'Cancelled') return false;
      const bKey = (b.targetId || b.id || b.title || b.vehicle || '').toLowerCase();
      const sameResource = bKey.includes(targetKey) || targetKey.includes(bKey);
      if (!sameResource) return false;

      // If scheduled, check date and time slot
      if (timingMode === 'schedule') {
        const bDate = b.scheduledDate || (b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : '');
        if (bDate === scheduledDate && b.scheduledTime === scheduledTime) {
          return true;
        }
      }
      return false;
    });
  }, [bookings, bookingItem, timingMode, scheduledDate, scheduledTime]);

  const checkSlotIsBooked = (slot) => {
    if (!bookings || bookings.length === 0) return false;
    const targetKey = (bookingItem.id || bookingItem.title || bookingItem.name || '').toLowerCase();
    return bookings.some((b) => {
      if (b.status === 'Cancelled') return false;
      const bKey = (b.targetId || b.id || b.title || b.vehicle || '').toLowerCase();
      const sameResource = bKey.includes(targetKey) || targetKey.includes(bKey);
      if (!sameResource) return false;
      const bDate = b.scheduledDate || (b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : '');
      return bDate === scheduledDate && b.scheduledTime === slot;
    });
  };

  // Quick date pickers
  const getDateOffset = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const handleApplyCoupon = (codeToApply = null) => {
    const code = (codeToApply || promoCodeInput).trim().toUpperCase();
    if (code === 'FIRST50') {
      setIsFirst50Applied(true);
      setPromoMessage('✓ FIRST50 Applied! Flat 50% discount credited on transit fare.');
    } else {
      setPromoMessage('✕ Invalid code. Use code FIRST50 for 50% off on your first ride.');
    }
  };

  const handleVerifyUpi = () => {
    if (!upiId.includes('@')) {
      setUpiVerificationMsg('✕ Invalid UPI ID. Format: name@bank (e.g. user@okhdfcbank)');
      setIsUpiVerified(false);
      return;
    }
    setIsUpiVerified(true);
    setUpiVerificationMsg(`✓ Verified: ${upiId} linked with NPCI / Razorpay Gateway.`);
  };

  const finalizeBooking = (extraMetadata = {}) => {
    const generatedId = 'RF-TN-' + Math.floor(100000 + Math.random() * 900000);
    const rideOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(rideOtp);

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 }
    });

    const assignedCaptainName = extraMetadata?.driverInfo?.name || 
      bookingItem.assignedDriverName || 
      bookingItem.driverOrHost || 
      (isTwoWheeler ? 'Rajesh Kumar (Royal Enfield Hunter)' : 'Karthik Raja (Swift Dzire AC)');

    const riderName = riderChoice === 'guest' && guestName.trim() ? guestName.trim() : (user?.name || 'RideFlow Commuter');
    const riderPhone = riderChoice === 'guest' && guestPhone.trim() ? guestPhone.trim() : (user?.phone || '+91 98401 23456');

    const bookingPayload = {
      id: generatedId,
      ...bookingItem,
      from: pickupLocation,
      to: dropLocation,
      driverOrHost: assignedCaptainName,
      assignedDriverName: assignedCaptainName,
      driverPhone: extraMetadata?.driverInfo?.phone || '+91 98401 23456',
      finalPrice,
      price: finalPrice,
      fare: finalPrice,
      discount: totalDiscount,
      otp: rideOtp,
      paymentMethod,
      paymentMethodName: paymentMethodLabels[paymentMethod],
      savings: totalDiscount + 120.00,
      isScheduled: timingMode === 'schedule',
      scheduledDate: timingMode === 'schedule' ? scheduledDate : todayStr,
      scheduledTime: timingMode === 'schedule' ? scheduledTime : 'Immediate Dispatch',
      rentalHours: timingMode === 'schedule' ? rentalHours : undefined,
      driverVehicleType: isTwoWheeler ? 'two-wheeler' : 'car',
      passengerCount: isTwoWheeler ? 1 : passengerCount,
      acPreference: isTwoWheeler ? 'N/A (Bike)' : acPreference.toUpperCase(),
      riderChoice,
      riderName,
      riderPhone,
      userPhone: riderPhone,
      phone: riderPhone,
      userEmail: user?.email || 'alex.chen@gmail.com',
      userName: user?.name || 'RideFlow Commuter',
      createdAt: new Date().toISOString(),
      ...extraMetadata
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
      alert('Insufficient wallet balance. Please select Razorpay, UPI QR, Card, or top-up your wallet.');
      return;
    }

    if (riderChoice === 'guest' && (!guestName.trim() || !guestPhone.trim())) {
      alert('Please provide the guest rider full name and mobile number.');
      return;
    }

    if (conflictingBooking) {
      alert(`Conflict: This vehicle/driver is already booked on ${scheduledDate} at ${scheduledTime}. Please choose another time slot.`);
      return;
    }

    // Razorpay Checkout Execution
    if (paymentMethod === 'razorpay') {
      setIsRazorpayProcessing(true);
      if (typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: 'rzp_test_rideflow2026',
          amount: Math.round(finalPrice * 100), // paisa
          currency: 'INR',
          name: 'RideFlow Mobility India',
          description: `Booking for ${bookingItem?.title || 'RideFlow Service'}`,
          image: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
          handler: function (response) {
            setIsRazorpayProcessing(false);
            finalizeBooking({ razorpayPaymentId: response.razorpay_payment_id });
          },
          prefill: {
            name: riderChoice === 'guest' ? guestName : (user?.name || 'RideFlow Commuter'),
            email: user?.email || 'alex.chen@gmail.com',
            contact: riderChoice === 'guest' ? guestPhone : (user?.phone || '+91 98401 23456')
          },
          theme: {
            color: '#4f46e5'
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setIsRazorpayProcessing(false);
          alert('Razorpay Payment Notice: ' + (response.error?.description || 'Gateway closed. Proceeding to simulated authorization.'));
          finalizeBooking({ razorpayPaymentId: 'pay_rzp_mock_' + Math.floor(100000 + Math.random() * 900000) });
        });
        rzp.open();
        return;
      } else {
        // Fallback simulation if external script is blocked
        setTimeout(() => {
          setIsRazorpayProcessing(false);
          finalizeBooking({ razorpayPaymentId: 'pay_rzp_sim_' + Math.floor(100000 + Math.random() * 900000) });
        }, 800);
        return;
      }
    }

    const isDriverOrBikeTaxi = Boolean(
      bookingItem?.mode?.toLowerCase().includes('driver') ||
      bookingItem?.mode?.toLowerCase().includes('taxi') ||
      bookingItem?.mode?.toLowerCase().includes('chauffeur') ||
      bookingItem?.mode?.toLowerCase().includes('ride')
    );

    if (isDriverOrBikeTaxi && timingMode === 'now') {
      // Cascading Driver Dispatch Sequence: Driver 1 -> Auto-Cascade -> Driver 2
      setDispatchStage('dispatching_1');
      setTimeout(() => {
        setDispatchStage('rejected_1');
        setTimeout(() => {
          setDispatchStage('dispatching_2');
          setTimeout(() => {
            const captain = {
              name: isTwoWheeler ? 'Rajesh Kumar' : 'Alex Chen',
              phone: '+91 98401 23456',
              vehicleModel: isTwoWheeler ? 'Royal Enfield Hunter 350' : 'Toyota Innova Crysta XL (AC)',
              vehiclePlate: isTwoWheeler ? 'TN-07-DE-4892' : 'TN-09-EV-8821',
              rating: 4.95,
              etaMins: 3
            };
            setAssignedDriver(captain);
            finalizeBooking({ driverInfo: captain });
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

  const handleShareTrip = () => {
    const url = `https://rideflow.tn/trip/${confirmedBooking?.id || 'RF-TN-4892'}`;
    navigator.clipboard?.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        
        {/* =========================================================================
            1. INITIAL REVIEW & CONFIRMATION VIEW
            ========================================================================= */}
        {dispatchStage === 'idle' && (
          <div className="space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Review & Confirm Transit Booking
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                    {bookingItem.mode} • Instant RideFlow Match
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. CHOOSE A RIDER (ME vs SOMEONE ELSE) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Who is Riding?</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Uber Guest Trips</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRiderChoice('me')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    riderChoice === 'me'
                      ? 'bg-indigo-600 text-white shadow-2xs border-indigo-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${riderChoice === 'me' ? 'bg-white text-indigo-700' : 'bg-slate-200 text-slate-700'}`}>
                    M
                  </div>
                  <span>Me ({user?.name?.split(' ')[0] || 'Myself'})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRiderChoice('guest')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    riderChoice === 'guest'
                      ? 'bg-indigo-600 text-white shadow-2xs border-indigo-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Order for Someone Else</span>
                </button>
              </div>

              {/* Guest Details Input */}
              {riderChoice === 'guest' && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-in">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Guest Rider Full Name:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pooja Sundaram"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Guest Mobile Number (For Driver Call):
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98401 55678"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. PICKUP & DROP LOCATIONS WITH LIVE API AUTOCOMPLETE */}
            <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Trip Origin & Destination</span>
                <span className="text-[9px] font-bold text-indigo-600 font-mono">⚡ All-India Live Geocoding API</span>
              </span>

              <div className="space-y-2">
                <LocationAutocomplete
                  label="Pickup Location (From)"
                  value={pickupLocation}
                  onChange={setPickupLocation}
                  placeholder="Enter pickup address, airport, station in India..."
                />

                <LocationAutocomplete
                  label="Drop Destination (To)"
                  value={dropLocation}
                  onChange={setDropLocation}
                  placeholder="Enter destination, IT corridor, hospital in India..."
                />
              </div>
            </div>

            {/* 3. TIMING SELECTOR: BOOK NOW vs SCHEDULE FOR LATER */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Booking Dispatch Timing
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTimingMode('now')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    timingMode === 'now'
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-400'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black block">Book Now</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                      Immediate pickup (~3 mins)
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTimingMode('schedule')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    timingMode === 'schedule'
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-400'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold flex-shrink-0">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black block">Schedule for Later</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                      Type Date, Slot & Duration
                    </span>
                  </div>
                </button>
              </div>

              {/* SCHEDULE DATE, TIME & DURATION (ALLOWS MANUAL TYPING) */}
              {timingMode === 'schedule' && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/80 border border-indigo-200 dark:border-indigo-900/60 space-y-3.5 animate-fade-in mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Scheduled Pickup Date</span>
                    </span>

                    <div className="flex items-center gap-1">
                      {[
                        { label: 'Today', val: todayStr },
                        { label: 'Tomorrow', val: getDateOffset(1) },
                        { label: '+2 Days', val: getDateOffset(2) }
                      ].map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => setScheduledDate(chip.val)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                            scheduledDate === chip.val
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="date"
                    value={scheduledDate}
                    min={todayStr}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />

                  {/* Manual Time Slot Input & Presets */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Type Scheduled Time Slot (or pick below):
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={scheduledTime.includes(':') && scheduledTime.length === 5 ? scheduledTime : '09:30'}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Type manual time (e.g. 10:45 AM)..."
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-28 overflow-y-auto p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      {TIME_SLOTS.map((slot) => {
                        const isBooked = checkSlotIsBooked(slot);
                        const isSelected = scheduledTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isBooked}
                            onClick={() => setScheduledTime(slot)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all text-center ${
                              isBooked
                                ? 'bg-rose-50 text-rose-400 border border-rose-200 line-through cursor-not-allowed opacity-60'
                                : isSelected
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span>{slot}</span>
                            {isBooked && <span className="block text-[8px] font-black text-rose-600">BOOKED</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Manual Duration (Hours / Days) Input */}
                  <div className="space-y-1.5 pt-2 border-t border-indigo-100 dark:border-slate-700">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Booking Duration (Type Manually in Hours):
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="168"
                        value={rentalHours}
                        onChange={(e) => setRentalHours(Math.max(1, Number(e.target.value)))}
                        className="w-28 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black text-indigo-700 dark:text-indigo-300 text-center"
                      />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Hours</span>

                      <div className="flex items-center gap-1 ml-auto">
                        {[
                          { h: 4, label: '4h' },
                          { h: 8, label: '8h (Day)' },
                          { h: 24, label: '24h (1 Day)' }
                        ].map((chip) => (
                          <button
                            key={chip.h}
                            type="button"
                            onClick={() => setRentalHours(chip.h)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                              rentalHours === chip.h
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Conflict alert if slot is occupied */}
                  {conflictingBooking && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>
                        Conflict Warning: This driver/fleet vehicle is already booked for {scheduledDate} at {scheduledTime} by another user.
                      </span>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* 4. DRIVER WITH VEHICLE OPTION (CAR WITH DRIVER OR BIKE WITH DRIVER) */}
            {isDriverService && (
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Driver with Vehicle (Ride with Driver)
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setDriverVehicleType('car'); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      !isTwoWheeler
                        ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-400'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black block">Car with Driver</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                        AC / Non-AC Sedan (1-6 Seats)
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setDriverVehicleType('two-wheeler'); setPassengerCount(1); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      isTwoWheeler
                        ? 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-500 text-cyan-900 dark:text-cyan-200 ring-2 ring-cyan-400'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold flex-shrink-0">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black block">Bike with Driver</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                        Solo Bike Taxi (Sanitized Helmet)
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* 5. NUMBER OF PASSENGERS & AC PREFERENCE (FOR CAR WITH DRIVER OR RENTAL CAR) */}
            {!isTwoWheeler ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Passenger Counter */}
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        {isRentalService 
                          ? 'Number of Passengers in Rental Car:' 
                          : 'Number of Passengers (Car with Driver):'}
                      </span>
                    </label>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPassengerCount(num)}
                          className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            passengerCount === num
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {passengerCount > 4 ? 'Requires SUV / XL Fleet' : 'Suitable for Hatchback / Sedan'}
                    </span>
                  </div>

                  {/* AC vs Non-AC Toggle */}
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Comfort (AC / Non-AC Car):</span>
                    </label>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAcPreference('ac')}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          acPreference === 'ac'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>❄️ AC Car</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAcPreference('non-ac')}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          acPreference === 'non-ac'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>🍃 Non-AC (-₹30)</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 text-cyan-900 dark:text-cyan-200">
                  <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold">
                    <Bike className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold block">Bike with Driver (Solo Bike Taxi)</span>
                    <span className="text-[10px] text-cyan-700 dark:text-cyan-300">
                      Solo Commuter (1 Seat) • Sanitized Helmet Provided
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-cyan-600 text-white font-mono font-bold text-[10px]">
                  1 Passenger
                </span>
              </div>
            )}

            {/* 6. PROMO CODE: 50% OFF FIRST RIDE */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="text-xs font-black text-amber-900 dark:text-amber-200">
                    🎉 Flat 50% OFF on First Ride!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyCoupon('FIRST50')}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors shadow-2xs"
                >
                  Apply FIRST50
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter Promo Code (FIRST50)..."
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white uppercase"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-extrabold cursor-pointer"
                >
                  Verify
                </button>
              </div>

              {promoMessage && (
                <p className={`text-[11px] font-bold ${isFirst50Applied ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {promoMessage}
                </p>
              )}
            </div>

            {/* 7. PAYMENT METHOD SELECTOR (RAZORPAY, UPI QR, CARD, WALLET, CASH) */}
            <div className="space-y-3">
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Select Payment Mode
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'razorpay', label: 'Razorpay', icon: Shield, badge: 'Popular' },
                  { id: 'upi', label: 'UPI QR', icon: QrCode, badge: 'Instant' },
                  { id: 'card', label: 'Card', icon: CreditCard, badge: null },
                  { id: 'wallet', label: 'Wallet', icon: Wallet, badge: `₹${walletBalance}` },
                  { id: 'cash', label: 'Cash', icon: Banknote, badge: 'On Trip' },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 relative ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-400'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {m.badge && (
                        <span className="absolute -top-1.5 right-1 px-1.5 py-0.2 rounded-full text-[8px] font-black bg-indigo-600 text-white uppercase">
                          {m.badge}
                        </span>
                      )}
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-bold">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* PAYMENT SUB-PANEL 1: RAZORPAY GATEWAY */}
              {paymentMethod === 'razorpay' && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2.5 animate-fade-in text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm">
                        R
                      </span>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white">Razorpay Payment Gateway</h4>
                        <span className="text-[10px] text-slate-500 font-medium">PCI-DSS Level 1 Certified • 256-Bit SSL</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                      ✓ Zero Surcharge
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Pay seamlessly with all Indian UPI Apps (GPay, PhonePe, Paytm), Credit & Debit Cards (RuPay, Visa, Mastercard) or Net Banking across 50+ banks.
                  </p>
                </div>
              )}

              {/* PAYMENT SUB-PANEL 2: UPI DYNAMIC QR & ACTIVE VPA */}
              {paymentMethod === 'upi' && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3.5 animate-fade-in text-xs">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    
                    {/* Generated Dynamic QR Code */}
                    <div className="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center flex-shrink-0">
                      <img
                        src={upiQrUrl}
                        alt="Dynamic Razorpay UPI QR Code"
                        className="w-36 h-36 rounded-xl object-contain"
                      />
                      <span className="text-[10px] font-mono font-black text-slate-700 mt-1">
                        Scan & Pay: ₹{finalPrice}
                      </span>
                      <span className="text-[9px] font-mono text-emerald-600 font-bold">
                        ⏱️ Expires: {Math.floor(qrCountdown / 60)}:{('0' + (qrCountdown % 60)).slice(-2)}
                      </span>
                    </div>

                    {/* QR Details & Merchant Address */}
                    <div className="space-y-2 flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                          Dynamic Merchant QR Code
                        </span>
                        <button
                          type="button"
                          onClick={() => { setQrGeneratedAt(Date.now()); setQrCountdown(300); }}
                          className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Refresh QR</span>
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Beneficiary:</span>
                          <strong className="text-slate-900 dark:text-white">RideFlow Mobility Technologies India Pvt Ltd</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Merchant VPA:</span>
                          <code className="text-indigo-600 font-bold font-mono">rideflow.mobility@razorpay</code>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Merchant Address:</span>
                          <span className="text-slate-600 dark:text-slate-400 text-[10px] leading-tight block">
                            RideFlow Tech Park, OMR IT Highway, Sholinganallur, Chennai - 600119 (GSTIN: 33AAACR4921F1ZX)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Editable, Active UPI ID Input & Verify */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Or Enter Your UPI ID / VPA:
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => { setUpiId(e.target.value); setIsUpiVerified(false); }}
                        placeholder="e.g. mobile@paytm or name@okhdfcbank"
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyUpi}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs cursor-pointer shadow-xs"
                      >
                        Verify & Pay
                      </button>
                    </div>

                    {upiVerificationMsg && (
                      <span className={`text-[10px] font-bold block ${isUpiVerified ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {upiVerificationMsg}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* PAYMENT SUB-PANEL 3: CREDIT / DEBIT CARD INPUTS */}
              {paymentMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                      Credit or Debit Card Details
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      RuPay • Visa • Mastercard
                    </span>
                  </div>

                  {/* Card Number */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      16-Digit Card Number:
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        maxLength="19"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 8921 4421 9081"
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Expiry Date */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Expiry Date (MM/YY):
                      </label>
                      <input
                        type="text"
                        maxLength="5"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    {/* CVV */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        CVV (3 Digits):
                      </label>
                      <input
                        type="password"
                        maxLength="4"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Cardholder Name:
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name as printed on card"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* PAYMENT SUB-PANEL 4: WALLET */}
              {paymentMethod === 'wallet' && (
                <div className={`p-3 rounded-xl border text-xs ${isWalletInsufficient ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-purple-50/60 border-purple-200 text-purple-900'}`}>
                  {isWalletInsufficient ? (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        Insufficient balance (₹{walletBalance} &lt; ₹{finalPrice})
                      </span>
                      <button
                        type="button"
                        onClick={() => addWalletFunds(500)}
                        className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        + Top-Up ₹500
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center font-bold">
                      <span>Wallet balance after deduction:</span>
                      <span className="text-sm font-mono text-emerald-700">₹{walletBalance - finalPrice}</span>
                    </div>
                  )}
                </div>
              )}

              {/* PAYMENT SUB-PANEL 5: CASH ON TRIP */}
              {paymentMethod === 'cash' && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-black">
                    <Banknote className="w-4 h-4 text-amber-700" />
                    <span>Pay Cash Directly to Captain</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    No advance payment required. Simply pay ₹{finalPrice} in cash or UPI directly to your assigned captain after your trip completes.
                  </p>
                </div>
              )}

            </div>

            {/* Loyalty Points Redemption Toggle */}
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Redeem Reward Discount</p>
                  <p className="text-[10px] text-amber-800 dark:text-amber-300 font-medium">Instant ₹50.00 off transit fare</p>
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
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-medium">
              <div className="flex justify-between text-slate-500">
                <span>Base Transit Rate ({isTwoWheeler ? 'Solo Bike Taxi' : `Car • ${acPreference.toUpperCase()}`})</span>
                <span className="text-slate-900 dark:text-white font-bold font-mono">₹{basePrice}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Platform Safety & SOS Telemetry Fee</span>
                <span className="text-slate-900 dark:text-white font-mono">₹5.00</span>
              </div>
              {isFirst50Applied && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Promo FIRST50 (50% Off First Ride)</span>
                  <span className="font-mono">-₹{first50Discount}</span>
                </div>
              )}
              {usePoints && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Reward Points Discount</span>
                  <span className="font-mono">-₹{rewardDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total Amount Payable</span>
                <span className="text-emerald-600 font-mono text-base">₹{finalPrice}</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleConfirmBooking}
              disabled={isWalletInsufficient || Boolean(conflictingBooking) || isRazorpayProcessing}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {isRazorpayProcessing
                  ? 'Connecting to Razorpay Gateway...'
                  : paymentMethod === 'razorpay'
                  ? `Pay ₹${finalPrice} with Razorpay • Book Ride`
                  : paymentMethod === 'cash'
                  ? `Confirm Ride Booking (Pay ₹${finalPrice} Cash on Trip)`
                  : timingMode === 'schedule' 
                  ? `Confirm Scheduled Booking for ${scheduledDate} • ₹${finalPrice}` 
                  : `Confirm & Dispatch Ride Now • ₹${finalPrice}`}
              </span>
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
              <div className="absolute inset-0 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 shadow-inner">
                {isTwoWheeler ? (
                  <Bike className="w-8 h-8 text-indigo-600 animate-pulse" />
                ) : (
                  <Car className="w-8 h-8 text-indigo-600 animate-pulse" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                {dispatchStage === 'dispatching_1' && 'Contacting Nearby Captain 1...'}
                {dispatchStage === 'rejected_1' && 'Captain 1 Occupied • Auto-Cascading...'}
                {dispatchStage === 'dispatching_2' && 'Matching Top-Rated Captain 2...'}
                {dispatchStage === 'processing' && 'Locking Time Slot & Processing Booking...'}
              </span>
              
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {dispatchStage === 'dispatching_1' && 'Broadcasting Trip Route to Nearby Captains'}
                {dispatchStage === 'rejected_1' && 'Captain 1 was occupied. Re-routing instantly.'}
                {dispatchStage === 'dispatching_2' && 'Captain 2 Accepted! Locking ride slot...'}
                {dispatchStage === 'processing' && 'Reservation Confirmed in MongoDB Network'}
              </h3>

              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Matching verified {isTwoWheeler ? 'Two-Wheeler Bike Taxi' : 'Car Chauffeur'} with sanitized safety standards.
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            3. CONFIRMED RIDE RECEIPT - "RIDE BOOKING SUCCESSFUL" (NOT PAYMENT SUCCESS)
            ========================================================================= */}
        {dispatchStage === 'confirmed' && (
          <div className="text-center py-2 space-y-5 animate-scale-in">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-emerald-700 tracking-wider">
                {timingMode === 'schedule' ? 'Slot Locked & Scheduled on Network' : 'Captain Dispatched & En Route'}
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Ride Booking Successful! 🚀
              </h3>
              <p className="text-xs text-slate-500">
                Booking Reference: <span className="font-mono text-emerald-700 font-bold">{confirmedBooking?.id}</span>
              </p>
            </div>

            {/* Dual Communication Dispatch Notices: Email & Phone SMS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Email Dispatch Notice */}
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex flex-col justify-between gap-2 text-xs text-left">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-bold text-left text-[11px] truncate">
                    Email: <strong>{user?.email || 'alex.chen@gmail.com'}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailReceiptModal(true)}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] transition-colors cursor-pointer shadow-2xs"
                >
                  View Dispatched Email
                </button>
              </div>

              {/* SMS Dispatch Notice */}
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 flex flex-col justify-between gap-2 text-xs text-left">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="font-bold text-left text-[11px] truncate">
                    SMS: <strong>{confirmedBooking?.userPhone || confirmedBooking?.riderPhone || user?.phone || '+91 98401 23456'}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSmsReceiptModal(true)}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] transition-colors cursor-pointer shadow-2xs"
                >
                  View Phone SMS Message
                </button>
              </div>
            </div>

            {/* 4-Digit Ride Start OTP Banner */}
            {generatedOtp && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-purple-900 text-white space-y-1 shadow-md">
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-indigo-200">
                  4-Digit Ride Start OTP (Convey to Captain)
                </span>
                <p className="text-3xl font-mono font-black tracking-widest text-emerald-400">
                  {generatedOtp}
                </p>
                <p className="text-[11px] text-indigo-200">
                  Captain will verify this code before commencing journey.
                </p>
              </div>
            )}

            {/* Trip Details Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Rider:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {confirmedBooking?.riderName} ({confirmedBooking?.riderChoice === 'guest' ? 'Guest' : 'Self'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Service Mode:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {confirmedBooking?.mode} ({isTwoWheeler ? 'Solo Bike Taxi' : `Car • ${confirmedBooking?.acPreference || 'AC'}`})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Passengers:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {confirmedBooking?.passengerCount} Person{confirmedBooking?.passengerCount > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Pickup & Drop:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right truncate max-w-[240px]">
                  {confirmedBooking?.from} ➔ {confirmedBooking?.to}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Pickup Timing:</span>
                <span className="font-bold text-emerald-700">
                  {timingMode === 'schedule' ? `${scheduledDate} at ${scheduledTime}` : 'Immediate Dispatch'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Payment Status:</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-300">
                  {confirmedBooking?.paymentMethod === 'cash' 
                    ? `Cash on Trip (Pay ₹${finalPrice} to Captain)` 
                    : `Confirmed via ${confirmedBooking?.paymentMethodName}`}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-medium">Fare Amount:</span>
                <span className="font-black text-emerald-600 font-mono text-sm">₹{finalPrice}</span>
              </div>
            </div>

            {/* Uber/Rapido Safety & SOS Toolbar */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleShareTrip}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>{shareCopied ? '✓ Link Copied!' : 'Share Live Trip Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSosActive(!sosActive)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  sosActive
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>{sosActive ? '🚨 SOS Alert Active (112)' : 'Safety SOS (112)'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleDownloadPDF}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Official Tax Invoice (PDF)</span>
              </button>

              <button
                onClick={() => setShowRatePrompt(true)}
                className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>Rate This Experience</span>
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

      {/* Review Modal */}
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

      {/* Dispatched Email Receipt Modal */}
      {showEmailReceiptModal && (
        <EmailReceiptModal
          booking={confirmedBooking}
          user={user}
          onClose={() => setShowEmailReceiptModal(false)}
        />
      )}

      {/* Dispatched SMS Receipt Modal */}
      {showSmsReceiptModal && (
        <SmsReceiptModal
          booking={confirmedBooking}
          user={user}
          onClose={() => setShowSmsReceiptModal(false)}
        />
      )}
    </div>
  );
}
