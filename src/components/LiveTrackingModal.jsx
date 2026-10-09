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
  CheckCheck,
  Play,
  Square,
  FastForward,
  Wifi,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { io } from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { calculateDistanceKm } from '../utils/geoUtils';
import { api } from '../services/api';

export default function LiveTrackingModal({ trip, onClose, onOpenChat }) {
  const { user, verifyTripOtp } = useAuth();

  // Mode detection
  const isRental = trip?.mode === 'Self-Drive Rental' || trip?.id?.startsWith('rent') || trip?.category?.includes('rent');
  const isBike = trip?.type === 'bike' || trip?.vehicleType === 'bike' || trip?.category === 'bike' || 
                 trip?.name?.toLowerCase().includes('enfield') || trip?.vehicle?.toLowerCase().includes('hunter') || 
                 trip?.title?.toLowerCase().includes('bike') || trip?.title?.toLowerCase().includes('ola');

  // Booking room identifier for WebSockets
  const bookingId = trip?.id || trip?.bookingId || 'TN-LIVE-1234';

  // Perspective: 'passenger' or 'driver'
  const [activePerspective, setActivePerspective] = useState(user?.role === 'driver' ? 'driver' : 'passenger');
  const activePerspectiveRef = useRef(activePerspective);
  useEffect(() => {
    activePerspectiveRef.current = activePerspective;
  }, [activePerspective]);

  // Coordinates resolution
  const defaultPickup = { lat: 13.0827, lng: 80.2707, label: trip?.from || trip?.location || 'Chennai Central Hub' };
  const defaultDropoff = { lat: 12.9010, lng: 80.2279, label: trip?.to || 'OMR IT Corridor, Sholinganallur' };
  
  const pickupCoords = trip?.pickupCoords || trip?.gpsLocation || defaultPickup;
  const dropoffCoords = trip?.dropoffCoords || defaultDropoff;

  // Real-time telemetry state
  const [vehiclePos, setVehiclePos] = useState({
    lat: pickupCoords.lat + 0.0075,
    lng: pickupCoords.lng - 0.0065
  });
  const [speed, setSpeed] = useState(36);
  const [etaMinutes, setEtaMinutes] = useState(isRental ? 0 : 5);
  const [distanceKm, setDistanceKm] = useState(0.85);
  const [isLocked, setIsLocked] = useState(true);
  const [hornActive, setHornActive] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  // Socket.IO Connection & Simulation state
  const socketRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [driverStatusMessage, setDriverStatusMessage] = useState('Captain is approaching your pickup point');
  const [broadcastGpsActive, setBroadcastGpsActive] = useState(false);
  const watchIdRef = useRef(null);

  // OTP Verification state
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpVerified, setOtpVerified] = useState(trip?.isOtpVerified || false);

  // Chat state
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(() => {
    const storageKey = `rideflow_chat_${bookingId}`;
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
    const storageKey = `rideflow_chat_${bookingId}`;
    localStorage.setItem(storageKey, JSON.stringify(chatMessages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, bookingId]);

  // Connect to Socket.IO Server on Port 5000
  useEffect(() => {
    const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000'
      : window.location.origin;

    const socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      // Join ride-specific room
      socket.emit('join_ride', { bookingId });
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    // Listen for live driver coordinates broadcasted from simulator or driver tab
    socket.on('live_driver_pos', (data) => {
      const { lat, lng, speedKmH = 35, progress = 0 } = data;
      setVehiclePos({ lat, lng });
      setSpeed(speedKmH);
      setSimProgress(progress);

      // Move Leaflet driver marker smoothly without re-rendering
      if (vehicleMarkerRef.current) {
        vehicleMarkerRef.current.setLatLng([lat, lng]);
      }

      // Append point to traveled trail
      if (traveledPolylineRef.current) {
        const latlngs = traveledPolylineRef.current.getLatLngs();
        latlngs.push([lat, lng]);
        traveledPolylineRef.current.setLatLngs(latlngs);
      }

      // Recalculate dynamic Haversine distance and dynamic ETA
      if (mapInstanceRef.current) {
        const distanceMeters = mapInstanceRef.current.distance([lat, lng], [pickupCoords.lat, pickupCoords.lng]);
        const km = Math.max(0.05, +(distanceMeters / 1000).toFixed(2));
        setDistanceKm(km);

        const currentSpeed = Math.max(speedKmH, 18);
        const dynamicEta = Math.max(1, Math.round((km / currentSpeed) * 60));
        setEtaMinutes(dynamicEta);
      }
    });

    // Driver arrival notification
    socket.on('driver_arrived', (data) => {
      setDriverStatusMessage(data?.message || '🎉 Captain has arrived at your pickup spot!');
      setEtaMinutes(0);
      setDistanceKm(0);
      setSpeed(0);
      setIsSimulating(false);
    });

    // Ride status transition (OTP verified -> in progress)
    socket.on('trip_status_changed', (data) => {
      if (data?.status === 'in_progress') {
        setOtpVerified(true);
        setDriverStatusMessage('🚀 OTP Verified! Trip is now in progress.');
      } else if (data?.status === 'completed') {
        setDriverStatusMessage('🏁 Destination reached. Ride completed.');
      }
    });

    // Cross-tab real-time chat sync
    socket.on('new_ride_message', (data) => {
      if (data?.message) {
        setChatMessages((prev) => {
          if (prev.some(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    });

    // Simulation stopped notification
    socket.on('simulation_stopped', () => {
      setIsSimulating(false);
    });

    return () => {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      socket.disconnect();
    };
  }, [bookingId, pickupCoords.lat, pickupCoords.lng]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const startLat = pickupCoords.lat;
    const startLng = pickupCoords.lng;
    const endLat = dropoffCoords.lat;
    const endLng = dropoffCoords.lng;

    const centerLat = (startLat + endLat) / 2;
    const centerLng = (startLng + endLng) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // 100% Free OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Custom Passenger Pickup Pin
    const passengerIcon = L.divIcon({
      className: 'custom-passenger-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="width: 28px; height: 28px; background: #10b981; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16,185,129,0.5);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div style="background: rgba(15,23,42,0.9); color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; white-space: nowrap; margin-top: 4px; border: 1px solid rgba(255,255,255,0.2);">
            📍 Pickup
          </div>
        </div>
      `,
      iconSize: [80, 50],
      iconAnchor: [40, 25]
    });

    // Custom Destination Pin
    const destinationIcon = L.divIcon({
      className: 'custom-destination-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="width: 28px; height: 28px; background: #8b5cf6; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(139,92,246,0.5);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          </div>
          <div style="background: rgba(15,23,42,0.9); color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; white-space: nowrap; margin-top: 4px; border: 1px solid rgba(255,255,255,0.2);">
            🏁 Destination
          </div>
        </div>
      `,
      iconSize: [80, 50],
      iconAnchor: [40, 25]
    });

    // Animated Driver Vehicle Marker with Radar Glow
    const vehicleIcon = L.divIcon({
      className: 'custom-vehicle-radar-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="position: absolute; width: 44px; height: 44px; background: rgba(6,182,212,0.25); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; top: -7px;"></div>
          <div style="width: 34px; height: 34px; background: #0284c7; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(2,132,199,0.6); z-index: 10;">
            <span style="font-size: 16px;">${isBike ? '🏍️' : '🚗'}</span>
          </div>
          <div style="background: #0284c7; color: #ffffff; font-size: 10px; font-weight: 900; padding: 2px 7px; border-radius: 8px; white-space: nowrap; margin-top: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); z-index: 10;">
            LIVE • GPS
          </div>
        </div>
      `,
      iconSize: [90, 60],
      iconAnchor: [45, 25]
    });

    // Add Markers
    L.marker([startLat, startLng], { icon: passengerIcon }).addTo(map)
      .bindPopup(`<b>Pickup:</b> ${pickupCoords.label}`);

    L.marker([endLat, endLng], { icon: destinationIcon }).addTo(map)
      .bindPopup(`<b>Destination:</b> ${dropoffCoords.label}`);

    const vMarker = L.marker([vehiclePos.lat, vehiclePos.lng], { icon: vehicleIcon }).addTo(map);
    vehicleMarkerRef.current = vMarker;

    // Planned Route Path
    const waypoints = [
      [vehiclePos.lat, vehiclePos.lng],
      [startLat, startLng],
      [(startLat + endLat) / 2 + 0.004, (startLng + endLng) / 2 - 0.003],
      [endLat, endLng]
    ];

    const plannedRoute = L.polyline(waypoints, {
      color: '#06b6d4',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.7
    }).addTo(map);
    routePolylineRef.current = plannedRoute;

    // Traveled trail (solid line drawn behind driver)
    const traveledTrail = L.polyline([[vehiclePos.lat, vehiclePos.lng]], {
      color: '#10b981',
      weight: 5,
      opacity: 0.9
    }).addTo(map);
    traveledPolylineRef.current = traveledTrail;

    // Interactive Map Click: in Driver mode, click anywhere to move the car!
    map.on('click', (e) => {
      if (activePerspectiveRef.current === 'driver' && socketRef.current) {
        const { lat, lng } = e.latlng;
        socketRef.current.emit('driver_location_update', {
          bookingId,
          lat,
          lng,
          speedKmH: 42
        });
      }
    });

    mapInstanceRef.current = map;

    // Fit view to include vehicle, pickup, and destination
    map.fitBounds([
      [startLat, startLng],
      [endLat, endLng],
      [vehiclePos.lat, vehiclePos.lng]
    ], { padding: [50, 50] });

    // Invalidate map size to prevent gray tiles
    const t1 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200);
    const t2 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

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
        () => handleRecenter()
      );
    } else {
      handleRecenter();
    }
  };

  // 1-Laptop Route Simulation Controls (Calls Socket.IO Backend)
  const handleStartSimulation = () => {
    if (!socketRef.current) return;
    setIsSimulating(true);
    setDriverStatusMessage('🚗 Driver movement simulated along route (Socket.IO streaming)...');
    socketRef.current.emit('start_route_simulation', {
      bookingId,
      startCoords: { lat: vehiclePos.lat, lng: vehiclePos.lng },
      targetCoords: { lat: pickupCoords.lat, lng: pickupCoords.lng },
      speedMultiplier: 1.4
    });
  };

  const handleStopSimulation = () => {
    if (!socketRef.current) return;
    setIsSimulating(false);
    socketRef.current.emit('stop_route_simulation', { bookingId });
  };

  // Step driver manual ping (+1 step closer)
  const handleStepDriverPing = () => {
    if (!socketRef.current) return;
    const nextLat = vehiclePos.lat + (pickupCoords.lat - vehiclePos.lat) * 0.28;
    const nextLng = vehiclePos.lng + (pickupCoords.lng - vehiclePos.lng) * 0.28;
    socketRef.current.emit('driver_location_update', {
      bookingId,
      lat: nextLat,
      lng: nextLng,
      speedKmH: 38
    });
  };

  // Signal arrival at pickup spot
  const handleSignalArrival = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('driver_location_update', {
      bookingId,
      lat: pickupCoords.lat,
      lng: pickupCoords.lng,
      speedKmH: 0
    });
    socketRef.current.emit('driver_arrived_pickup', { bookingId });
  };

  // Method B: Device GPS / Chrome DevTools Sensors watchPosition
  const toggleDeviceGpsBroadcast = () => {
    if (broadcastGpsActive) {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setBroadcastGpsActive(false);
    } else {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
      }
      setBroadcastGpsActive(true);
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const speedKmh = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 32;
          if (socketRef.current) {
            socketRef.current.emit('driver_location_update', {
              bookingId,
              lat,
              lng,
              speedKmH: speedKmh
            });
          }
        },
        (err) => console.warn('WatchPosition error:', err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  // Passenger sends a message
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

    // Emit over Socket.IO to any open Driver tab/window
    if (socketRef.current) {
      socketRef.current.emit('send_ride_message', { bookingId, message: newMsg });
    }

    // Auto-reply simulation if no active driver tab responds
    setTimeout(() => {
      const lower = text.toLowerCase();
      let autoReply = "Got it! See you at the pickup point in 2 minutes.";
      if (lower.includes('where') || lower.includes('eta') || lower.includes('far')) {
        autoReply = `I am just ${distanceKm} km away. Arriving in ~${etaMinutes} mins in the ${trip?.vehicle || 'car'}!`;
      } else if (lower.includes('gate') || lower.includes('outside') || lower.includes('here')) {
        autoReply = "Noted! Turning on hazard blinkers so you can spot me right away.";
      } else if (lower.includes('ac') || lower.includes('cold') || lower.includes('cool')) {
        autoReply = "AC is set to cool 22°C. Sanitized vehicle ready!";
      }

      const replyMsg = {
        id: 'msg-reply-' + Date.now(),
        sender: 'driver',
        senderName: trip?.driverOrHost || trip?.hostName || 'Captain Karthik',
        text: autoReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages((prev) => [...prev, replyMsg]);
      if (socketRef.current) {
        socketRef.current.emit('send_ride_message', { bookingId, message: replyMsg });
      }
    }, 1800);
  };

  // Driver sends a reply
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

    if (socketRef.current) {
      socketRef.current.emit('send_ride_message', { bookingId, message: replyMsg });
    }
  };

  // Driver verifies Passenger OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    const input = otpInput.trim();
    if (!input || input.length !== 4) {
      setOtpError('Please enter the authentic 4-digit ride OTP.');
      return;
    }

    try {
      const res = await api.verifyOTP(trip?.id, input);
      if (res && res.success) {
        setOtpVerified(true);
        if (verifyTripOtp) verifyTripOtp(trip?.id, input);
        if (socketRef.current) {
          socketRef.current.emit('trip_status_changed', { bookingId, status: 'in_progress' });
        }
      } else {
        const targetOtp = trip?.otp || trip?.rideOtp || '4892';
        if (targetOtp && input === targetOtp) {
          setOtpVerified(true);
          if (verifyTripOtp) verifyTripOtp(trip?.id, input);
          if (socketRef.current) {
            socketRef.current.emit('trip_status_changed', { bookingId, status: 'in_progress' });
          }
        } else {
          setOtpError(res?.error || `Invalid OTP. Verification failed. Check 4-digit code on rider screen.`);
        }
      }
    } catch {
      const targetOtp = trip?.otp || trip?.rideOtp || '4892';
      if (targetOtp && input === targetOtp) {
        setOtpVerified(true);
        if (verifyTripOtp) verifyTripOtp(trip?.id, input);
        if (socketRef.current) {
          socketRef.current.emit('trip_status_changed', { bookingId, status: 'in_progress' });
        }
      } else {
        setOtpError(`Invalid OTP "${input}". Verification failed.`);
      }
    }
  };

  // Rental Controls
  const toggleKeylessLock = () => setIsLocked(!isLocked);
  const handleSoundHorn = () => {
    setHornActive(true);
    setTimeout(() => setHornActive(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[96vh] text-white">
        
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
                
                {/* Socket.IO Status Badge */}
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1 ${
                  socketConnected 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  {socketConnected ? `SOCKET.IO: ride_${bookingId}` : 'CONNECTING...'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isRental ? 'Keyless Telemetry • OpenStreetMap Satellite Sync' : `${trip?.from?.split('(')[0] || 'Origin'} ➔ ${trip?.to?.split('(')[0] || 'Destination'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Perspective Switcher (Passenger vs Driver / Simulator) */}
            {!isRental && (
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-700 text-xs font-bold">
                <button
                  onClick={() => setActivePerspective('passenger')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activePerspective === 'passenger' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Passenger</span>
                </button>
                <button
                  onClick={() => setActivePerspective('driver')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activePerspective === 'driver' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Driver Console</span>
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
        <div className="relative flex-1 min-h-[380px] sm:min-h-[440px] bg-slate-950 overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full z-10" style={{ minHeight: '380px', height: '100%' }} />

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

          {/* Top-Center Live Ride Status & Dynamic ETA Banner */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-3 bg-slate-900/95 border border-slate-700/90 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isSimulating ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'}`} />
              <span className="text-xs font-bold text-slate-200">
                {driverStatusMessage}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-1 text-emerald-400 font-extrabold text-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>{etaMinutes > 0 ? `ETA: ${etaMinutes} mins` : 'Arrived at spot!'}</span>
            </div>
          </div>

          {/* Telemetry HUD Badge */}
          <div className="absolute top-4 right-14 z-20 flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-2xl shadow-xl backdrop-blur-sm text-xs">
            <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold pr-2 border-r border-slate-700">
              <Zap className="w-3.5 h-3.5" />
              <span>{speed} KM/H</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold pr-2 border-r border-slate-700">
              <Clock className="w-3.5 h-3.5" />
              <span>{isRental ? 'Available' : `${etaMinutes} MINS ETA`}</span>
            </div>
            <div className="text-slate-300 font-mono font-bold">
              <span>{distanceKm} KM</span>
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
                    {activePerspective === 'driver' ? 'Passenger Direct Messages' : `Chat with ${trip?.driverOrHost || 'Driver'}`}
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

              {/* Quick Chips */}
              {activePerspective === 'passenger' && (
                <div className="p-2 border-t border-slate-800 bg-slate-950/50 flex items-center gap-1.5 overflow-x-auto">
                  {['Where are you?', 'Waiting at pickup', 'Turn on AC please', 'I have luggage'].map((chip) => (
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

              {/* Chat Form */}
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

        {/* Dedicated 1-Laptop Student Simulation & Telemetry Bar */}
        <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Perspective-based Toolbar */}
          {activePerspective === 'passenger' ? (
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-[10px]">
                  🎓 1-LAPTOP WORKFLOW
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">
                  Test real-time Socket.IO GPS without 2 phones:
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!isSimulating ? (
                  <button
                    onClick={handleStartSimulation}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Route Simulation</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopSimulation}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Stop Simulation ({simProgress}%)</span>
                  </button>
                )}

                <button
                  onClick={handleStepDriverPing}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
                  title="Emit +1 GPS coordinate step towards pickup"
                >
                  <FastForward className="w-3 h-3 text-cyan-400" />
                  <span>Step +1 Ping</span>
                </button>

                <button
                  onClick={() => setActivePerspective('driver')}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-bold text-xs border border-indigo-500/40 transition-colors cursor-pointer"
                >
                  Open Driver View ➔
                </button>
              </div>
            </div>
          ) : (
            /* Driver Cockpit & Telemetry Toolbar */
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono font-bold text-[10px]">
                  🕹️ DRIVER COCKPIT (TAB 2)
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">
                  Broadcasting coordinates to room: <code className="text-cyan-400">ride_{bookingId}</code>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!isSimulating ? (
                  <button
                    onClick={handleStartSimulation}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Trip Simulation</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopSimulation}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Pause Sim</span>
                  </button>
                )}

                <button
                  onClick={handleSignalArrival}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1 shadow-md cursor-pointer"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Arrived at Pickup</span>
                </button>

                <button
                  onClick={toggleDeviceGpsBroadcast}
                  className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 border transition-colors cursor-pointer ${
                    broadcastGpsActive 
                      ? 'bg-cyan-600 text-white border-cyan-400 animate-pulse' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                  title="Stream physical browser GPS or DevTools Sensors emulation live"
                >
                  <Wifi className="w-3 h-3 text-cyan-400" />
                  <span>{broadcastGpsActive ? 'Streaming Sensor GPS' : 'Sensors Emulation'}</span>
                </button>
              </div>
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

          {/* OTP Section: Passenger View shows OTP / Driver View lets Captain verify it */}
          {!isRental && (
            <div className="flex items-center gap-3 bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-slate-700">
              {activePerspective === 'passenger' ? (
                <>
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-[9px] text-amber-300 uppercase font-black block">Ride Start OTP</span>
                      <span className="font-mono text-base font-black text-amber-400 tracking-widest">
                        {trip?.rideOtp || trip?.otp || '4892'}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ${
                    otpVerified ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-800 text-slate-300 border-slate-600'
                  }`}>
                    {otpVerified ? '✓ OTP Verified' : 'Share with Driver'}
                  </span>
                </>
              ) : (
                /* Driver enters Passenger OTP */
                <form onSubmit={handleVerifyOtp} className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-400" />
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-center font-mono font-bold text-xs text-amber-300 tracking-wider focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Verify
                  </button>
                  {otpVerified && <span className="text-emerald-400 text-xs font-bold">✓ Active</span>}
                  {otpError && <span className="text-rose-400 text-[10px]">{otpError}</span>}
                </form>
              )}
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
