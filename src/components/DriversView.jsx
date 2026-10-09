import React, { useState, useMemo } from 'react';
import { 
  Car, 
  Search, 
  Star, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  MessageSquare, 
  Sparkles, 
  ArrowUpDown, 
  Navigation, 
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Radio,
  Bike,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { estimateRoute, calculateDriverFare } from '../utils/fareEstimator';
import { getLiveRating } from '../utils/ratings';
import { calculateDistanceKm, estimateWalkingOrDrivingTime, TN_TRANSIT_HUBS } from '../utils/geoUtils';
import ReportModal from './ReportModal';
import LiveTrackingModal from './LiveTrackingModal';
import LocationAutocomplete from './LocationAutocomplete';
import { Calendar } from 'lucide-react';

export default function DriversView({ onOpenChat, onRequestDriver }) {
  const { drivers, reviews } = useAuth();
  
  // User GPS Proximity State
  const [userHub, setUserHub] = useState(TN_TRANSIT_HUBS[0]); // default Chennai Central
  const [isUsingDeviceGps, setIsUsingDeviceGps] = useState(false);

  // Live route fare estimator state
  const [fromRoute, setFromRoute] = useState('Chennai Central Railway Station');
  const [toRoute, setToRoute] = useState('OMR IT Expressway (Sholinganallur)');
  const [selectedTier, setSelectedTier] = useState('economy'); // 'bike' | 'economy' | 'comfort' | 'xl'

  // Search & Filter state
  const [searchName, setSearchName] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('nearest');
  const [vehicleFilter, setVehicleFilter] = useState('all'); // 'all' | 'bike' | 'cab'

  // Modals
  const [reportingDriver, setReportingDriver] = useState(null);
  const [trackingDriver, setTrackingDriver] = useState(null);

  // Handle GPS location request from device
  const handleDetectDeviceGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserHub({
            id: 'device_current_gps',
            name: '📍 My Current Location (Device GPS)',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setIsUsingDeviceGps(true);
          setSortBy('nearest');
        },
        () => {
          alert('Could not retrieve device GPS. Defaulting to Chennai Central Hub.');
        }
      );
    }
  };

  // Derive live fare breakdown from route
  const liveRoute = useMemo(() => {
    return estimateRoute(fromRoute, toRoute);
  }, [fromRoute, toRoute]);

  const liveFare = useMemo(() => {
    if (selectedTier === 'bike') {
      const distanceCost = liveRoute.distanceKm * 6;
      const baseFare = 20;
      const total = Math.round(baseFare + distanceCost);
      return {
        baseFare,
        distanceCost,
        surgeCost: 0,
        subtotal: total,
        gst: Math.round(total * 0.05),
        total,
        etaMinutes: Math.max(3, Math.round(liveRoute.durationMins * 0.7))
      };
    }
    return calculateDriverFare(liveRoute, selectedTier);
  }, [liveRoute, selectedTier]);

  // Filter and sort driver list
  const filteredDrivers = useMemo(() => {
    return drivers
      .map((driver) => {
        const driverLat = driver.currentLocation?.lat || 13.0827;
        const driverLng = driver.currentLocation?.lng || 80.2707;
        const distance = calculateDistanceKm(userHub.lat, userHub.lng, driverLat, driverLng);
        const estTime = estimateWalkingOrDrivingTime(distance);
        const computedDistance = distance !== null ? distance : (driver.distanceKm || 1.2);
        const computedEta = Math.max(2, Math.round(computedDistance * 2.5));

        return {
          ...driver,
          calculatedDistanceKm: computedDistance,
          calculatedEtaMins: computedEta,
          estimatedTime: estTime,
          liveRating: getLiveRating({
            reviews,
            targetType: 'driver',
            targetName: driver.name,
            fallbackRating: driver.rating,
            fallbackCount: driver.reviewCount
          })
        };
      })
      .filter((driver) => {
        const isBikeCaptain = driver.category === 'bike' || driver.type === 'bike' || driver.vehicleModel?.toLowerCase().includes('enfield') || driver.vehicleModel?.toLowerCase().includes('jupiter') || driver.name?.toLowerCase().includes('rajesh');

        if (vehicleFilter === 'bike' && !isBikeCaptain) return false;
        if (vehicleFilter === 'cab' && isBikeCaptain) return false;

        if (searchName.trim()) {
          const query = searchName.toLowerCase();
          const matchesName = driver.name.toLowerCase().includes(query);
          const matchesVehicle = driver.vehicleModel.toLowerCase().includes(query);
          const matchesCity = driver.city?.toLowerCase().includes(query);
          if (!matchesName && !matchesVehicle && !matchesCity) {
            return false;
          }
        }

        if (minRating > 0 && driver.liveRating.rating < minRating) {
          return false;
        }

        return true;
      }).sort((a, b) => {
        if (sortBy === 'nearest') return a.calculatedDistanceKm - b.calculatedDistanceKm;
        if (sortBy === 'top-rated') return b.liveRating.rating - a.liveRating.rating;
        if (sortBy === 'experienced') return b.trips - a.trips;
        return 0;
      });
  }, [drivers, reviews, searchName, minRating, sortBy, vehicleFilter, userHub]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const totalPages = Math.ceil(filteredDrivers.length / (pageSize === 'all' ? (filteredDrivers.length || 1) : pageSize));
  const displayedDrivers = useMemo(() => {
    if (pageSize === 'all') return filteredDrivers;
    const start = (currentPage - 1) * pageSize;
    return filteredDrivers.slice(start, start + pageSize);
  }, [filteredDrivers, currentPage, pageSize]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white/95 space-y-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold uppercase tracking-wider mb-2">
              <Car className="w-3.5 h-3.5" />
              Tamil Nadu Driver with Vehicle Fleet
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ride with Driver • Driver with Vehicle (Car & Bike)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Book certified drivers with vehicles across Tamil Nadu: Car with Driver (AC/Non-AC, 1-6 seats) or Bike with Driver (Solo Bike Taxi) with verified captain ratings, 4-digit Ride Start OTP, and live telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-800 font-extrabold">{filteredDrivers.length} Active Captains Nearby</span>
          </div>
        </div>

        {/* Live Corridor Fare Calculator Bar */}
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 text-white space-y-4 shadow-xl">
          {/* All-India Route Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b border-slate-800">
            <div>
              <LocationAutocomplete
                label="Pickup Location (All-India)"
                value={fromRoute}
                onChange={setFromRoute}
                placeholder="Type pickup city, airport, station..."
                icon={MapPin}
              />
            </div>
            <div>
              <LocationAutocomplete
                label="Drop-off Destination (All-India)"
                value={toRoute}
                onChange={setToRoute}
                placeholder="Type destination..."
                icon={Navigation}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-400 block">
                Instant Corridor Quote
              </span>
              <h3 className="text-sm font-extrabold text-white">
                {fromRoute.split('(')[0]} ➔ {toRoute.split('(')[0]}
              </h3>
            </div>

            {/* Tier Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl overflow-x-auto">
              {[
                { id: 'bike', label: 'Bike Taxi (2-Wheeler)', icon: Bike, desc: 'Solo Fast' },
                { id: 'economy', label: 'Swift Sedan (Car)', icon: Car, desc: '4 Seats' },
                { id: 'comfort', label: 'Prime Sedan (Car)', icon: Car, desc: 'Premium' },
                { id: 'xl', label: 'Innova XL (Car)', icon: Car, desc: '6 Seats' },
              ].map((tier) => {
                const isSelected = selectedTier === tier.id;
                const Icon = tier.icon;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tier.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-400">
                Est. Distance: <strong className="text-white font-mono">{liveRoute.distanceKm} km</strong>
              </span>
              <span className="text-slate-400">
                ETA: <strong className="text-emerald-400 font-mono">~{liveFare.etaMinutes} mins</strong>
              </span>
              <span className="text-slate-400">
                Ride Start OTP: <strong className="text-amber-400 font-mono">4892</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xl font-black text-cyan-400 departure-digit">₹{liveFare.total}</span>
                <span className="text-[10px] text-slate-400 block font-medium">5% GST included</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Book Now */}
                <button
                  onClick={() => {
                    if (onRequestDriver) {
                      onRequestDriver({
                        mode: selectedTier === 'bike' ? 'Ride with Driver (Two-Wheeler)' : 'Ride with Driver (Car)',
                        title: `${selectedTier === 'bike' ? 'Solo Bike Taxi' : 'Chauffeur Cab'} (${fromRoute.split('(')[0].trim()} to ${toRoute.split('(')[0].trim()})`,
                        price: liveFare.total,
                        details: `Direct Dispatch • ~${liveFare.etaMinutes} mins • OTP: 4892`,
                        driverOrHost: selectedTier === 'bike' ? 'Rajesh Kumar (Royal Enfield Hunter 350)' : 'Karthik Selvam (Innova Crysta)',
                        vehicle: selectedTier === 'bike' ? 'Royal Enfield Hunter 350' : 'Toyota Innova Crysta',
                        driverVehicleType: selectedTier === 'bike' ? 'two-wheeler' : 'car',
                        isScheduled: false,
                        pickupLocation: fromRoute,
                        dropoffLocation: toRoute,
                        rideOtp: '4892'
                      });
                    }
                  }}
                  className="py-2.5 px-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all cursor-pointer whitespace-nowrap"
                >
                  ⚡ Book Now
                </button>

                {/* Schedule For Later */}
                <button
                  onClick={() => {
                    if (onRequestDriver) {
                      onRequestDriver({
                        mode: selectedTier === 'bike' ? 'Ride with Driver (Two-Wheeler)' : 'Ride with Driver (Car)',
                        title: `${selectedTier === 'bike' ? 'Solo Bike Taxi' : 'Chauffeur Cab'} (${fromRoute.split('(')[0].trim()} to ${toRoute.split('(')[0].trim()})`,
                        price: liveFare.total,
                        details: `Scheduled Dispatch • ~${liveFare.etaMinutes} mins • OTP: 4892`,
                        driverOrHost: selectedTier === 'bike' ? 'Rajesh Kumar (Royal Enfield Hunter 350)' : 'Karthik Selvam (Innova Crysta)',
                        vehicle: selectedTier === 'bike' ? 'Royal Enfield Hunter 350' : 'Toyota Innova Crysta',
                        driverVehicleType: selectedTier === 'bike' ? 'two-wheeler' : 'car',
                        isScheduled: true,
                        pickupLocation: fromRoute,
                        dropoffLocation: toRoute,
                        rideOtp: '4892'
                      });
                    }
                  }}
                  className="py-2.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Proximity Location & Device GPS Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              Nearest Captains Around:
            </span>
            <select
              value={userHub.id}
              onChange={(e) => {
                const found = TN_TRANSIT_HUBS.find(h => h.id === e.target.value);
                if (found) {
                  setUserHub(found);
                  setIsUsingDeviceGps(false);
                  setSortBy('nearest');
                }
              }}
              className="bg-white border border-blue-300 text-slate-900 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer"
            >
              {TN_TRANSIT_HUBS.map((hub) => (
                <option key={hub.id} value={hub.id}>
                  {hub.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleDetectDeviceGps}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                isUsingDeviceGps 
                  ? 'bg-emerald-600 text-white shadow-emerald-200'
                  : 'bg-white hover:bg-blue-100 text-blue-800 border border-blue-300'
              }`}
              title="Use device GPS to calculate live captain distance"
            >
              <Navigation className={`w-3.5 h-3.5 ${isUsingDeviceGps ? 'animate-pulse' : ''}`} />
              <span>{isUsingDeviceGps ? '📍 GPS Locked' : '📍 Near Me (GPS)'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-300 text-slate-900 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-xs cursor-pointer"
            >
              <option value="nearest">📍 Nearest First (Proximity)</option>
              <option value="top-rated">★ Highest Rated</option>
              <option value="experienced">Trips Completed</option>
            </select>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Vehicle Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'all', label: 'All Captains', icon: null },
              { id: 'bike', label: 'Bike Taxis Only', icon: Bike },
              { id: 'cab', label: 'Cabs & SUVs Only', icon: Car },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => setVehicleFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    vehicleFilter === f.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 text-blue-600" />}
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Search captain name, plate..."
              style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-400 shadow-xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

      </div>

      {/* Driver List Grid */}
      {filteredDrivers.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-slate-200 bg-white space-y-3 shadow-sm">
          <Car className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No captains match your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your search query or selecting "All Captains".
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedDrivers.map((driver) => {
              const isBikeCaptain = driver.category === 'bike' || driver.type === 'bike' || driver.vehicleModel?.toLowerCase().includes('enfield') || driver.vehicleModel?.toLowerCase().includes('jupiter') || driver.name?.toLowerCase().includes('rajesh');

              return (
                <div
                  key={driver.id}
                  className="glass-panel rounded-3xl p-5 border border-slate-200 bg-white hover:shadow-xl transition-all group flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={driver.avatar}
                            alt={driver.name}
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-100 group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {driver.name}
                          </h4>
                          <span className="font-mono text-[11px] text-slate-500 font-bold block">
                            {driver.licensePlate}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        isBikeCaptain ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        {isBikeCaptain ? <Bike className="w-3 h-3 text-cyan-600" /> : <Car className="w-3 h-3 text-blue-600" />}
                        {driver.categoryName?.split('(')[0] || (isBikeCaptain ? 'Solo Bike' : 'Chauffeur Cab')}
                      </span>
                    </div>

                    {/* Proximity Distance Badge */}
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-extrabold">
                      <Compass className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>📍 {driver.calculatedDistanceKm} km away</span>
                      <span className="text-blue-400">•</span>
                      <span className="text-blue-700 font-medium">~{driver.calculatedEtaMins} mins ETA</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Rating</span>
                        <span className="font-extrabold text-slate-900">★ {driver.liveRating.rating}</span>
                      </div>
                      <div className="border-x border-slate-200">
                        <span className="text-[10px] text-slate-400 font-semibold block">Trips</span>
                        <span className="font-bold text-slate-800 departure-digit">{driver.trips}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Pickup ETA</span>
                        <span className="font-extrabold text-emerald-600 font-mono">~{driver.calculatedEtaMins}m</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      Vehicle: <strong className="text-slate-800">{driver.vehicleModel}</strong> • {driver.city || 'Tamil Nadu'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Report Driver Button */}
                      <button
                        onClick={() => setReportingDriver(driver)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 transition-colors"
                        title="Report Driver (3-Strike Policy)"
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>

                      {/* Live Telemetry Radar */}
                      <button
                        onClick={() => setTrackingDriver({
                          title: driver.vehicleModel,
                          vehicle: driver.vehicleModel,
                          driverName: driver.name,
                          driverAvatar: driver.avatar,
                          rideOtp: '4892',
                          isOtpVerified: true,
                          from: userHub.name,
                          to: 'OMR IT Corridor',
                          pickupCoords: { lat: userHub.lat, lng: userHub.lng },
                          dropoffCoords: { lat: 12.9010, lng: 80.2279 },
                          mode: isBikeCaptain ? 'Bike Taxi' : 'Book a Driver'
                        })}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 border border-slate-200 transition-colors"
                        title="Track Live GPS Radar"
                      >
                        <Radio className="w-4 h-4" />
                      </button>

                      {/* Chat Action */}
                      {onOpenChat && (
                        <button
                          onClick={() => onOpenChat(driver, 'driver')}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 transition-colors"
                          title="Chat with Captain"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Dispatch & Schedule Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (onRequestDriver) {
                            onRequestDriver({
                              id: driver.id,
                              targetId: driver.id,
                              driverId: driver.id,
                              mode: isBikeCaptain ? 'Ride with Driver (Two-Wheeler)' : 'Ride with Driver (Car)',
                              title: `${driver.name} • ${driver.vehicleModel}`,
                              price: isBikeCaptain ? 140 : 420,
                              details: `Instant Captain Dispatch • ${driver.licensePlate} • OTP: 4892 • ~${driver.calculatedEtaMins} mins away`,
                              driverOrHost: driver.name,
                              vehicle: driver.vehicleModel,
                              driverAvatar: driver.avatar,
                              driverVehicleType: isBikeCaptain ? 'two-wheeler' : 'car',
                              isScheduled: false,
                              rideOtp: '4892',
                              pickupCoords: { lat: userHub.lat, lng: userHub.lng }
                            });
                          }
                        }}
                        className={`py-2 px-3 rounded-xl font-extrabold text-[11px] text-white shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer ${
                          isBikeCaptain ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        title="Book Captain Immediately"
                      >
                        <span>⚡ Instant</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onRequestDriver) {
                            onRequestDriver({
                              id: driver.id,
                              targetId: driver.id,
                              driverId: driver.id,
                              mode: isBikeCaptain ? 'Ride with Driver (Two-Wheeler)' : 'Ride with Driver (Car)',
                              title: `${driver.name} • ${driver.vehicleModel}`,
                              price: isBikeCaptain ? 140 : 420,
                              details: `Scheduled Captain Reservation • ${driver.licensePlate} • OTP: 4892`,
                              driverOrHost: driver.name,
                              vehicle: driver.vehicleModel,
                              driverAvatar: driver.avatar,
                              driverVehicleType: isBikeCaptain ? 'two-wheeler' : 'car',
                              isScheduled: true,
                              rideOtp: '4892',
                              pickupCoords: { lat: userHub.lat, lng: userHub.lng }
                            });
                          }
                        }}
                        className="py-2 px-2.5 rounded-xl font-bold text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Schedule this Captain for Date & Time"
                      >
                        <Calendar className="w-3 h-3 text-indigo-600" />
                        <span>Schedule</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Bar for Captains */}
          {filteredDrivers.length > 0 && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="text-xs text-slate-600 font-medium">
                Showing <strong className="text-slate-900">{pageSize === 'all' ? 1 : (currentPage - 1) * pageSize + 1}</strong> – <strong className="text-slate-900">{pageSize === 'all' ? filteredDrivers.length : Math.min(currentPage * pageSize, filteredDrivers.length)}</strong> of <strong className="text-blue-600 font-extrabold">{filteredDrivers.length} Verified Captains</strong>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Show:</span>
                {[12, 24, 'all'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => { setPageSize(sz); setCurrentPage(1); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                      pageSize === sz ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {sz === 'all' ? 'All (40)' : sz}
                  </button>
                ))}
              </div>

              {pageSize !== 'all' && totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Prev
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                          currentPage === pageNum ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="px-1 text-slate-400 text-xs font-bold">...</span>}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Driver Incident Report Modal */}
      {reportingDriver && (
        <ReportModal
          targetUser={reportingDriver}
          onClose={() => setReportingDriver(null)}
        />
      )}

      {/* Live GPS Telemetry Modal */}
      {trackingDriver && (
        <LiveTrackingModal
          trip={trackingDriver}
          onClose={() => setTrackingDriver(null)}
          onOpenChat={onOpenChat}
        />
      )}

    </div>
  );
}
