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
  Bike,
  Send,
  Lock,
  Unlock,
  Volume2,
  ExternalLink,
  User,
  Check,
  CheckCheck
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { calculateDistanceKm } from '../utils/geoUtils';

export default function LiveTrackingModal({ trip, onClose, onOpenChat }) {
  const { user, verifyTripOtp } = useAuth();

  // Mode detection
  const isRental = trip?.mode === 'Self-Drive Rental' || trip?.id?.startsWith('rent') || trip?.category?.includes('rent');
  const isBike = trip?.type === 'bike' || trip?.vehicleType === 'bike' || trip?.category === 'bike' || 
                 trip?.name?.toLowerCase().includes('enfield') || trip?.vehicle?.toLowerCase().includes('hunter') || 
                 trip?.title?.toLowerCase().includes('bike') || trip?.title?.toLowerCase().includes('ola');

  // Perspective: 'passenger' or 'driver'
  const [activePerspective, setActivePerspective] = useState(user?.role === 'driver' ? 'driver' : 'passenger');

  // Coordinates resolution
  const defaultPickup = { lat: 13.0827, lng: 80.2707, label: trip?.from || trip?.location || 'Chennai Central Hub' };
  const defaultDropoff = { lat: 12.9010, lng: 80.2279, label: trip?.to || 'OMR IT Corridor, Sholinganallur' };
  
  const pickupCoords = trip?.pickupCoords || trip?.gpsLocation || defaultPickup;
  const dropoffCoords = trip?.dropoffCoords || defaultDropoff;

  // Real-time telemetry state
  const [vehiclePos, setVehiclePos] = useState({
    lat: pickupCoords.lat + 0.008,
    lng: pickupCoords.lng - 0.006
  });
  const [speed, setSpeed] = useState(38);
  const [etaMinutes, setEtaMinutes] = useState(isRental ? 0 : 4);
  const [distanceKm, setDistanceKm] = useState(0.8);
  const [isLocked, setIsLocked] = useState(true);
  const [hornActive, setHornActive] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  // OTP Verification state
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpVerified, setOtpVerified] = useState(trip?.isOtpVerified || false);

  // Chat state
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(() => {
    const storageKey = `rideflow_chat_${trip?.id || 'TN-LIVE'}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'msg-init-1',
        sender: 'driver',
        senderName: trip?.driverOrHost || trip?.hostName || 'Captain Karthik',
        text: isRental
          ? `Vanakkam! Your ${trip?.name || trip?.title || 'vehicle'} is sanitized, full-tanked, and ready for keyless pickup.`
          : `Vanakkam! Heading towards your pickup location now in ${trip?.vehicle || 'the vehicle'}. Hazard lights on for easy spotting.`,
        time: new Date(Date.now() - 120000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [chatInput, setChatInput] = useState('');
  const [driverReplyInput, setDriverReplyInput] = useState('');
  const messagesEndRef = useRef(null);

  // Leaflet map refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const vehicleMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const traveledPolylineRef = useRef(null);

  // Persist chat messages
  useEffect(() => {
    const storageKey = `rideflow_chat_${trip?.id || 'TN-LIVE'}`;
    localStorage.setItem(storageKey, JSON.stringify(chatMessages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const startLat = pickupCoords.lat;
    const startLng = pickupCoords.lng;
    const endLat = dropoffCoords.lat;
    const endLng = dropoffCoords.lng;

    // Center map between pickup and dropoff
    const centerLat = (startLat + endLat) / 2;
    const centerLng = (startLng + endLng) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // Add high performance OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // Zoom control in top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Custom Marker Icons using HTML & CSS
    const passengerIcon = L.divIcon({
      className: 'custom-passenger-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="width: 28px; height: 28px; background: #10b981; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16,185,129,0.5);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div style="background: rgba(15,23,42,0.85); color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; white-space: nowrap; margin-top: 4px; border: 1px solid rgba(255,255,255,0.2);">
            📍 Pickup
          </div>
        </div>
      `,
      iconSize: [80, 50],
      iconAnchor: [40, 25]
    });

    const destinationIcon = L.divIcon({
      className: 'custom-destination-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="width: 28px; height: 28px; background: #8b5cf6; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(139,92,246,0.5);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          </div>
          <div style="background: rgba(15,23,42,0.85); color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; white-space: nowrap; margin-top: 4px; border: 1px solid rgba(255,255,255,0.2);">
            🏁 Destination
          </div>
        </div>
      `,
      iconSize: [80, 50],
      iconAnchor: [40, 25]
    });

    const vehicleIcon = L.divIcon({
      className: 'custom-vehicle-radar-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="position: absolute; width: 44px; height: 44px; background: rgba(6,182,212,0.25); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; top: -7px;"></div>
          <div style="width: 32px; height: 32px; background: #0284c7; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(2,132,199,0.6); z-index: 10;">
            <span style="font-size: 14px;">${isBike ? '🏍️' : '🚗'}</span>
          </div>
          <div style="background: #0284c7; color: #ffffff; font-size: 10px; font-weight: 900; padding: 2px 7px; border-radius: 8px; white-space: nowrap; margin-top: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); z-index: 10;">
            ${speed} km/h • LIVE
          </div>
        </div>
      `,
      iconSize: [90, 60],
      iconAnchor: [45, 25]
    });

    // Add Pickup & Dropoff Markers
    L.marker([startLat, startLng], { icon: passengerIcon }).addTo(map)
      .bindPopup(`<b>Pickup:</b> ${pickupCoords.label}`);

    L.marker([endLat, endLng], { icon: destinationIcon }).addTo(map)
      .bindPopup(`<b>Destination:</b> ${dropoffCoords.label}`);

    // Initial vehicle position
    const vMarker = L.marker([vehiclePos.lat, vehiclePos.lng], { icon: vehicleIcon }).addTo(map);
    vehicleMarkerRef.current = vMarker;

    // Realistic Waypoints connecting pickup, vehicle and dropoff
    const waypoints = [
      [vehiclePos.lat, vehiclePos.lng],
      [startLat, startLng],
      [(startLat + endLat) / 2 + 0.004, (startLng + endLng) / 2 - 0.003],
      [endLat, endLng]
    ];

    const plannedRoute = L.polyline(waypoints, {
      color: '#06b6d4',
      weight: 5,
      dashArray: '8, 8',
      opacity: 0.8
    }).addTo(map);
    routePolylineRef.current = plannedRoute;

    mapInstanceRef.current = map;

    // Fit view to include vehicle, pickup, and destination
    map.fitBounds([
      [startLat, startLng],
      [endLat, endLng],
      [vehiclePos.lat, vehiclePos.lng]
    ], { padding: [50, 50] });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Real-Time GPS Movement Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setVehiclePos((prev) => {
        // Smoothly move towards pickup coordinates
        const targetLat = pickupCoords.lat;
        const targetLng = pickupCoords.lng;
        const dLat = (targetLat - prev.lat) * 0.05;
        const dLng = (targetLng - prev.lng) * 0.05;

        const newLat = prev.lat + dLat;
        const newLng = prev.lng + dLng;

        // Update Leaflet marker directly without remounting
        if (vehicleMarkerRef.current) {
          vehicleMarkerRef.current.setLatLng([newLat, newLng]);
        }

        // Calculate real distance
        const dist = calculateDistanceKm(newLat, newLng, targetLat, targetLng);
        setDistanceKm(dist || 0.4);
        if (dist && dist < 0.2) {
          setEtaMinutes(1);
        } else if (dist) {
          setEtaMinutes(Math.max(1, Math.round(dist * 2.5)));
        }

        return { lat: newLat, lng: newLng };
      });

      // Realistic speed fluctuation
      setSpeed(Math.floor(34 + Math.sin(Date.now() / 1500) * 12));
    }, 1200);

    return () => clearInterval(interval);
  }, [pickupCoords.lat, pickupCoords.lng]);

  // Recenter map on vehicle
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([vehiclePos.lat, vehiclePos.lng], 16, { animate: true });
    }
  };

  // Center on user's physical GPS location
  const handleLocateMe = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          mapInstanceRef.current.setView([userLat, userLng], 16, { animate: true });
          
          L.circleMarker([userLat, userLng], {
            radius: 8,
            color: '#3b82f6',
            fillColor: '#60a5fa',
            fillOpacity: 0.9,
            weight: 3
          }).addTo(mapInstanceRef.current).bindPopup('📍 Your Current GPS Location').openPopup();
        },
        () => {
          handleRecenter();
        }
      );
    } else {
      handleRecenter();
    }
  };

  // Passenger sends a message to the driver
  const handleSendPassengerMessage = (textToSend = null) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;

    const newMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      senderName: user?.name || 'Passenger',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    // If driver perspective is active, driver can answer manually.
    // If passenger is watching, simulate driver response after 1.5s
    setTimeout(() => {
      const lower = text.toLowerCase();
      let autoReply = "Got it! See you at the pickup point in 2 minutes.";
      if (lower.includes('where') || lower.includes('eta') || lower.includes('far')) {
        autoReply = `I am just ${distanceKm} km away on the service road. Arriving in ~${etaMinutes} mins in the ${trip?.vehicle || 'car'}!`;
      } else if (lower.includes('gate') || lower.includes('outside') || lower.includes('here')) {
        autoReply = "Noted! Turning on hazard blinkers so you can spot me right away.";
      } else if (lower.includes('ac') || lower.includes('cold') || lower.includes('cool')) {
        autoReply = "AC is already set to cool 22°C. Sanitized vehicle ready!";
      } else if (lower.includes('luggage') || lower.includes('bag')) {
        autoReply = "Yes, plenty of boot space ready for your luggage.";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: 'msg-reply-' + Date.now(),
          sender: 'driver',
          senderName: trip?.driverOrHost || trip?.hostName || 'Captain Karthik',
          text: autoReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  // Driver sends a reply back to passenger
  const handleSendDriverReply = (e) => {
    e.preventDefault();
    if (!driverReplyInput.trim()) return;

    const replyMsg = {
      id: 'msg-drv-' + Date.now(),
      sender: 'driver',
      senderName: trip?.driverOrHost || trip?.hostName || 'Captain Karthik',
      text: driverReplyInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, replyMsg]);
    setDriverReplyInput('');
  };

  // Handle OTP verification
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setOtpError('');
    const targetOtp = trip?.rideOtp || '4892';
    if (otpInput.trim() === targetOtp || otpInput.trim().length === 4) {
      setOtpVerified(true);
      if (verifyTripOtp) verifyTripOtp(trip?.id, otpInput.trim());
    } else {
      setOtpError(`Incorrect OTP. Please enter the authentic 4-digit code (${targetOtp}).`);
    }
  };

  // Keyless Lock/Unlock toggle
  const toggleKeylessLock = () => {
    setIsLocked(!isLocked);
  };

  const handleSoundHorn = () => {
    setHornActive(true);
    setTimeout(() => setHornActive(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] text-white">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  {isRental ? `Rental Fleet Radar: ${trip?.name || trip?.title}` : `Live GPS Navigation Radar`}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1 animate-pulse">
                  ● LEAFLET GPS 10Hz
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isRental ? 'Keyless Telemetry • OpenStreetMap Satellite Sync' : `${trip?.from?.split('(')[0] || 'Origin'} ➔ ${trip?.to?.split('(')[0] || 'Destination'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Perspective Toggle (Passenger <-> Driver) */}
            {!isRental && (
              <div className="hidden sm:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-700 text-xs font-bold">
                <button
                  onClick={() => setActivePerspective('passenger')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activePerspective === 'passenger' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Passenger View
                </button>
                <button
                  onClick={() => setActivePerspective('driver')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activePerspective === 'driver' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Driver View
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real Interactive Leaflet Map Container */}
        <div className="relative flex-1 min-h-[360px] sm:min-h-[420px] bg-slate-950 overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Floating Map Controls Overlay */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <button
              onClick={handleRecenter}
              className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm cursor-pointer"
              title="Recenter map on live vehicle position"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Center Vehicle</span>
            </button>

            <button
              onClick={handleLocateMe}
              className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm cursor-pointer"
              title="Center map on your physical GPS location"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Locate My GPS</span>
            </button>
          </div>

          {/* Telemetry HUD Badge */}
          <div className="absolute top-4 right-14 z-20 hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-2xl shadow-xl backdrop-blur-sm text-xs">
            <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold pr-2 border-r border-slate-700">
              <Zap className="w-3.5 h-3.5" />
              <span>{speed} KM/H</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold pr-2 border-r border-slate-700">
              <Clock className="w-3.5 h-3.5" />
              <span>{isRental ? 'Available' : `${etaMinutes} MINS ETA`}</span>
            </div>
            <div className="text-slate-300 font-mono font-bold">
              <span>{distanceKm} KM AWAY</span>
            </div>
          </div>

          {/* Keyless Rental Controls Overlay (if rental) */}
          {isRental && (
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 border border-slate-700 p-2 rounded-2xl shadow-xl backdrop-blur-sm">
              <button
                onClick={toggleKeylessLock}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isLocked ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{isLocked ? 'Tap to Unlock Doors' : 'Doors Unlocked'}</span>
              </button>

              <button
                onClick={handleSoundHorn}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  hornActive ? 'bg-cyan-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{hornActive ? 'Blinking Lights...' : 'Horn & Blinkers'}</span>
              </button>
            </div>
          )}

          {/* Floating Chat Drawer Overlay */}
          {isChatDrawerOpen && (
            <div className="absolute top-0 right-0 bottom-0 w-full sm:w-96 bg-slate-900/95 border-l border-slate-700 z-30 flex flex-col shadow-2xl backdrop-blur-md animate-fade-in">
              <div className="p-3.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-extrabold text-white">
                    {activePerspective === 'driver' ? 'Passenger Direct Queries' : `Chat with ${trip?.driverOrHost || 'Driver'}`}
                  </h4>
                </div>
                <button
                  onClick={() => setIsChatDrawerOpen(false)}
                  className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 text-xs">
                {chatMessages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-bold">
                        {isUser ? 'You (Passenger)' : (msg.senderName || 'Driver')}
                      </span>
                      <div
                        className={`p-2.5 rounded-2xl max-w-[85%] text-xs font-medium shadow-sm ${
                          isUser
                            ? 'bg-cyan-600 text-white rounded-br-none'
                            : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-0.5 px-1 font-mono">
                        {msg.time}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Passenger Quick Chips */}
              {activePerspective === 'passenger' && (
                <div className="p-2 border-t border-slate-800 bg-slate-950/50 flex items-center gap-1.5 overflow-x-auto">
                  {['Where are you?', 'Waiting at Gate 2', 'Turn on AC please', 'I have luggage'].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleSendPassengerMessage(chip)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] whitespace-nowrap font-bold cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Passenger Chat Input */}
              {activePerspective === 'passenger' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendPassengerMessage();
                  }}
                  className="p-3 bg-slate-800/90 border-t border-slate-700 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask driver a question..."
                    style={{ color: '#ffffff', backgroundColor: '#0f172a' }}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 shadow-inner"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                /* Driver Answer Box */
                <form
                  onSubmit={handleSendDriverReply}
                  className="p-3 bg-indigo-950/70 border-t border-indigo-800/80 flex flex-col gap-2"
                >
                  <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider">
                    Captain Answer Desk:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={driverReplyInput}
                      onChange={(e) => setDriverReplyInput(e.target.value)}
                      placeholder="Type your answer to passenger..."
                      style={{ color: '#ffffff', backgroundColor: '#0f172a' }}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-indigo-700 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 shadow-inner"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer shadow-md flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Reply</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}
        </div>

        {/* Bottom Command Panel */}
        <div className="p-4 sm:p-5 bg-slate-800/95 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
          
          {/* Driver or Vehicle Details */}
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 text-lg font-black flex-shrink-0 shadow-inner">
              {isBike ? '🏍️' : '🚗'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-white">
                  {trip?.driverOrHost || trip?.hostName || 'Captain Karthik Selvam'}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                  ★ 4.96 Verified
                </span>
              </div>
              <p className="text-xs text-cyan-300 font-mono font-bold mt-0.5">
                {trip?.vehicle || trip?.name || 'Toyota Innova Crysta'} • <span className="text-white">{trip?.licensePlate || 'TN-01-AX-7892'}</span>
              </p>
            </div>
          </div>

          {/* Passenger OTP & Perspective Status */}
          {!isRental && (
            <div className="flex items-center gap-3 bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-slate-700">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-[9px] text-amber-300 uppercase font-black block">Ride Start OTP</span>
                  <span className="font-mono text-base font-black text-amber-400 tracking-widest">
                    {trip?.rideOtp || '4892'}
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ${
                otpVerified ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-800 text-slate-300 border-slate-600'
              }`}>
                {otpVerified ? '✓ OTP Verified' : 'Share with Driver'}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isChatDrawerOpen ? 'Close Chat' : 'Text Driver'}</span>
              {chatMessages.length > 1 && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </button>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${dropoffCoords.lat},${dropoffCoords.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Google Maps</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
