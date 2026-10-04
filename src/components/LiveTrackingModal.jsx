import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  AlertTriangle, 
  Share2, 
  X, 
  CheckCircle2, 
  Compass, 
  Zap,
  Key,
  Flame,
  Radio,
  Clock,
  Car,
  Bike
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LiveTrackingModal({ trip, onClose, onOpenChat }) {
  const { verifyTripOtp } = useAuth();
  const [progress, setProgress] = useState(trip?.status === 'in_progress' ? 55 : 20);
  const [speed, setSpeed] = useState(38);
  const [etaMinutes, setEtaMinutes] = useState(trip?.status === 'in_progress' ? 12 : 6);
  const [distanceKm, setDistanceKm] = useState(trip?.status === 'in_progress' ? 5.8 : 2.1);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isDriverModeOpen, setIsDriverModeOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  // Default coordinates fallback if trip doesn't have them
  const pickup = trip?.pickupCoords || { lat: 13.0827, lng: 80.2707, label: trip?.from || 'Chennai Central' };
  const dropoff = trip?.dropoffCoords || { lat: 12.9010, lng: 80.2279, label: trip?.to || 'OMR IT Corridor' };

  const isBike = trip?.type === 'bike' || trip?.vehicleType === 'bike' || trip?.mode === 'bike' || trip?.title?.toLowerCase().includes('bike') || trip?.vehicle?.toLowerCase().includes('enfield') || trip?.vehicle?.toLowerCase().includes('jupiter') || trip?.vehicle?.toLowerCase().includes('ola') || trip?.vehicle?.toLowerCase().includes('aerox');

  // Real-time animation loop simulating GPS movement
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        const next = prev + 0.4;
        return next;
      });

      // Fluctuate speed realistically
      setSpeed(Math.floor(36 + Math.sin(Date.now() / 1500) * 12));
      
      // Update ETA
      setEtaMinutes((prev) => (prev > 1 && Math.random() > 0.8 ? prev - 1 : prev));
      setDistanceKm((prev) => (prev > 0.3 ? parseFloat((prev - 0.05).toFixed(2)) : 0.2));
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setOtpError('');
    try {
      verifyTripOtp(trip.id, otpInput.trim());
      setIsDriverModeOpen(false);
    } catch (err) {
      setOtpError(err.message || 'Incorrect OTP. Ask the passenger for the 4-digit code.');
    }
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(`https://rideflow.in/track/${trip.id || 'TN-LIVE-TRIP'}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleTriggerSOS = () => {
    setSosActive(true);
    setTimeout(() => {
      alert('🚨 EMERGENCY PROTOCOL ACTIVATED: Live GPS telemetry and driver details broadcasted to Tamil Nadu Police Control (112) & RideFlow Safety Command Center.');
    }, 200);
  };

  // SVG Canvas points calculations
  const p1 = { x: 70, y: 320 };
  const p2 = { x: 260, y: 190 };
  const p3 = { x: 440, y: 240 };
  const p4 = { x: 650, y: 100 };

  // Calculate current point along the bezier curve
  const t = progress / 100;
  const currentX = (1-t)*(1-t)*(1-t)*p1.x + 3*(1-t)*(1-t)*t*p2.x + 3*(1-t)*t*t*p3.x + t*t*t*p4.x;
  const currentY = (1-t)*(1-t)*(1-t)*p1.y + 3*(1-t)*(1-t)*t*p2.y + 3*(1-t)*t*t*p3.y + t*t*t*p4.y;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-white">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">
                  Live Telemetry & GPS Radar
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1 animate-pulse">
                  ● LIVE SATELLITE 10Hz
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tracking {trip?.title || trip?.vehicle || 'Vehicle'} • TN Corridor Real-Time Feed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareLink}
              className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{copiedLink ? 'Copied Link!' : 'Share Live Trip'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Map Visualizer */}
        <div className="relative flex-1 min-h-[300px] bg-slate-950 overflow-hidden flex items-center justify-center">
          
          {/* Map Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#6366f1 1px, #020617 1px)',
              backgroundSize: '32px 32px',
              backgroundPosition: '0 0, 16px 16px'
            }}
          />

          {/* Road Network SVG & Vehicle Position */}
          <svg className="w-full h-full absolute inset-0 preserve-3d" viewBox="0 0 720 400">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Simulated Road Arteries */}
            <path d="M 20 180 Q 200 150 400 200 T 700 220" stroke="#1e293b" strokeWidth="18" fill="none" strokeLinecap="round" />
            <path d="M 120 380 Q 300 300 480 180 T 680 40" stroke="#1e293b" strokeWidth="18" fill="none" strokeLinecap="round" />
            <path d="M 300 380 Q 400 250 450 150 T 550 20" stroke="#1e293b" strokeWidth="12" fill="none" strokeLinecap="round" />

            {/* Active GPS Route Guideway */}
            <path
              d={`M ${p1.x} ${p1.y} C ${p2.x} ${p2.y}, ${p3.x} ${p3.y}, ${p4.x} ${p4.y}`}
              stroke="url(#routeGradient)"
              strokeWidth="6"
              fill="none"
              strokeDasharray="8 4"
              className="animate-pulse"
              filter="url(#glow)"
            />

            {/* Traveled Route Trajectory */}
            <path
              d={`M ${p1.x} ${p1.y} C ${p2.x} ${p2.y}, ${p3.x} ${p3.y}, ${p4.x} ${p4.y}`}
              stroke="#06b6d4"
              strokeWidth="6"
              fill="none"
              strokeDasharray="500"
              strokeDashoffset={500 - (progress / 100) * 500}
            />

            {/* Pickup Node */}
            <g transform={`translate(${p1.x}, ${p1.y})`}>
              <circle r="14" fill="#06b6d4" fillOpacity="0.2" className="animate-ping" />
              <circle r="8" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
              <text x="14" y="5" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                Pickup: {trip?.from?.split(',')[0] || 'Origin'}
              </text>
            </g>

            {/* Dropoff Destination Node */}
            <g transform={`translate(${p4.x}, ${p4.y})`}>
              <circle r="14" fill="#8b5cf6" fillOpacity="0.2" className="animate-ping" />
              <circle r="8" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" />
              <text x="-160" y="-10" fill="#c084fc" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                Drop: {trip?.to?.split(',')[0] || 'Destination'}
              </text>
            </g>

            {/* Moving Vehicle Node */}
            <g transform={`translate(${currentX}, ${currentY})`}>
              {/* Radar Pulse Wave */}
              <circle r="26" fill="#38bdf8" fillOpacity="0.15" className="animate-ping" />
              <circle r="18" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" />
              
              {/* Vehicle SVG Icon inside Node */}
              {isBike ? (
                <path
                  d="M -7 -2 L -3 -6 L 3 -6 L 7 -2 L 5 4 L -5 4 Z"
                  fill="#ffffff"
                />
              ) : (
                <rect x="-8" y="-5" width="16" height="10" rx="3" fill="#ffffff" />
              )}
              
              {/* Live Speed Badge Label */}
              <g transform="translate(24, -12)">
                <rect x="0" y="0" width="76" height="24" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                <text x="8" y="16" fill="#38bdf8" fontSize="11" fontWeight="900" fontFamily="monospace">
                  {speed} KM/H
                </text>
              </g>
            </g>
          </svg>

          {/* Floating Live Telemetry HUD (Overlaid Top Left) */}
          <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-2xl shadow-xl flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold font-mono">
                {speed}
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Velocity</p>
                <p className="font-bold text-slate-100">km / hour</p>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-700" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold font-mono">
                {etaMinutes}m
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Estimated Arrival</p>
                <p className="font-bold text-slate-100">{distanceKm} km away</p>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-700" />

            <div className="hidden sm:flex items-center gap-2">
              <Compass className="w-6 h-6 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Heading</p>
                <p className="font-bold text-slate-100">74° ENE (Corridor)</p>
              </div>
            </div>
          </div>

          {/* Floating Emergency SOS Pill (Overlaid Top Right) */}
          <div className="absolute top-4 right-4">
            <button
              onClick={handleTriggerSOS}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all ${
                sosActive
                  ? 'bg-red-600 text-white animate-bounce'
                  : 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{sosActive ? 'SOS BROADCASTING' : 'Emergency SOS'}</span>
            </button>
          </div>

          {/* Floating OTP Banner (Passenger instruction) */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-slate-900/95 backdrop-blur-md border border-amber-500/40 p-3.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-black">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-amber-300">Ride Start OTP</span>
                  {trip?.isOtpVerified ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Trip Verified & Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                      Awaiting Boarding
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300">
                  {trip?.isOtpVerified 
                    ? 'OTP validated. Enjoy your safe journey across Tamil Nadu.' 
                    : 'Share this code with your captain/driver upon boarding:'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-1.5 rounded-xl bg-amber-500/10 border border-amber-400/60 font-mono font-black text-xl text-amber-300 tracking-widest shadow-inner">
                {trip?.rideOtp || '4892'}
              </div>

              {!trip?.isOtpVerified && (
                <button
                  onClick={() => setIsDriverModeOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Driver Simulator
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Details Footer */}
        <div className="p-4 sm:p-5 bg-slate-800/90 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Driver Profile */}
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="relative">
              <img
                src={trip?.driverAvatar || (isBike ? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80')}
                alt="Driver"
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-cyan-500/50"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-white">
                  {trip?.driverName || trip?.host || 'Rajesh Kumar'}
                </h4>
                <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px] font-bold">
                  ★ {trip?.rating || '4.9'}
                </span>
              </div>
              <p className="text-xs text-cyan-300 font-mono font-bold">
                {trip?.vehicle || (isBike ? 'Royal Enfield Hunter 350' : 'Hyundai Creta SX')} • <span className="text-white">{trip?.vehicleNumber || 'TN-07-DE-4892'}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <a
              href="tel:+919840123456"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Call Driver</span>
            </a>

            {onOpenChat && (
              <button
                onClick={() => {
                  onClose();
                  onOpenChat(
                    { name: trip?.driverName || 'Driver', vehicle: trip?.vehicle },
                    'driver'
                  );
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>
            )}
          </div>
        </div>

        {/* Driver OTP Verification Simulator Modal Overlay */}
        {isDriverModeOpen && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-extrabold text-sm text-white">Driver App: Verify OTP</h4>
                </div>
                <button
                  onClick={() => setIsDriverModeOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Simulate driver Rajesh Kumar verifying the 4-digit passenger OTP to initiate the journey.
              </p>

              {otpError && (
                <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold">
                  {otpError}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Enter Passenger's 4-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    autoFocus
                    placeholder="e.g. 4892"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-center font-mono font-black text-xl text-cyan-300 tracking-widest focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Hint: OTP generated for this trip is <strong className="text-cyan-400">{trip?.rideOtp || '4892'}</strong>
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpInput(trip?.rideOtp || '4892')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300"
                  >
                    Auto-Fill
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
                  >
                    Verify & Start Ride
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
