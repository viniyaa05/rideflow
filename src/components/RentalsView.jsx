import React, { useState, useMemo } from 'react';
import { 
  KeyRound, 
  Search, 
  SlidersHorizontal, 
  BatteryCharging, 
  Users, 
  Star, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ArrowUpDown, 
  Fuel, 
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  ShieldAlert,
  Radio,
  Bike,
  Car,
  Navigation,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLiveRating } from '../utils/ratings';
import { calculateDistanceKm, estimateWalkingOrDrivingTime, TN_TRANSIT_HUBS } from '../utils/geoUtils';
import ReportModal from './ReportModal';
import LiveTrackingModal from './LiveTrackingModal';

export default function RentalsView({ onBookRental, onOpenChat }) {
  const { rentals, reviews } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [maxHourlyPrice, setMaxHourlyPrice] = useState(750);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('nearest'); // 'nearest' | 'price-asc' | 'price-desc' | 'rating-desc' | 'range-desc'

  // User GPS Proximity State
  const [userHub, setUserHub] = useState(TN_TRANSIT_HUBS[0]); // default Chennai Central
  const [isUsingDeviceGps, setIsUsingDeviceGps] = useState(false);
  const [maxDistanceFilter, setMaxDistanceFilter] = useState('all'); // 'all' | '3' | '5' | '15'
  
  // Modals
  const [reportingHost, setReportingHost] = useState(null);
  const [trackingRental, setTrackingRental] = useState(null);

  const vehicleTypes = ['All', 'Bikes & Scooters', 'Electric', 'SUV', 'Sedan', 'Hatchback'];

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

  // 1. Normalized Rentals Memoization (Prevents schema mismatches between MongoDB & Frontend)
  const normalizedRentals = useMemo(() => {
    return (rentals || []).map((item) => {
      const displayName = item.name || item.title || item.model || 'Standard Vehicle';
      const hourly = Number(item.hourlyPrice ?? item.pricePerHour ?? 180);
      const daily = Number(item.dailyPrice ?? (hourly * 8));
      const typeStr = item.type || (item.category?.includes('bike') ? 'Bike' : 'Sedan');

      return {
        ...item,
        name: displayName,
        title: displayName,
        hourlyPrice: hourly,
        dailyPrice: daily,
        type: typeStr,
        rangeKm: Number(item.rangeKm || 450),
        seats: Number(item.seats || (typeStr === 'Bike' ? 2 : 4)),
        transmission: item.transmission || 'Manual',
        location: item.location || 'Chennai Central Hub',
        liveRating: getLiveRating({
          reviews,
          targetType: 'rental',
          targetName: displayName,
          fallbackRating: item.rating || 4.8,
          fallbackCount: item.reviews || 12
        })
      };
    });
  }, [rentals, reviews]);

  // 2. Filtering & Sorting logic
  const filteredRentals = useMemo(() => {
    return normalizedRentals
      .map((car) => {
        const carLat = car.gpsLocation?.lat || 13.0827;
        const carLng = car.gpsLocation?.lng || 80.2707;
        const distance = calculateDistanceKm(userHub?.lat || 13.0827, userHub?.lng || 80.2707, carLat, carLng);
        const estTime = estimateWalkingOrDrivingTime(distance);

        return {
          ...car,
          distanceKm: distance !== null ? distance : 1.2,
          estimatedTime: estTime
        };
      })
      .filter((car) => {
        const carNameLower = (car.name || '').toLowerCase();

        if (selectedType === 'Bikes & Scooters') {
          const isBike = car.type === 'Bike' || 
            car.category === 'bike' || 
            car.category === 'bike-rent' ||
            carNameLower.includes('enfield') || 
            carNameLower.includes('jupiter') || 
            carNameLower.includes('ola') || 
            carNameLower.includes('aerox') ||
            carNameLower.includes('scooter');
          if (!isBike) return false;
        } else if (selectedType !== 'All') {
          if (car.type !== selectedType && !car.category?.includes(selectedType.toLowerCase())) {
            return false;
          }
        }

        if (car.hourlyPrice > maxHourlyPrice) {
          return false;
        }
        if (minRating > 0 && car.liveRating?.rating < minRating) {
          return false;
        }

        // Distance filter
        if (maxDistanceFilter !== 'all') {
          const maxD = parseFloat(maxDistanceFilter);
          if (car.distanceKm > maxD) return false;
        }

        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesName = carNameLower.includes(query);
          const matchesBrand = (car.brand || '').toLowerCase().includes(query);
          const matchesLocation = (car.location || '').toLowerCase().includes(query);
          if (!matchesName && !matchesBrand && !matchesLocation) {
            return false;
          }
        }
        return true;
      }).sort((a, b) => {
        if (sortBy === 'nearest') return a.distanceKm - b.distanceKm;
        if (sortBy === 'price-asc') return a.hourlyPrice - b.hourlyPrice;
        if (sortBy === 'price-desc') return b.hourlyPrice - a.hourlyPrice;
        if (sortBy === 'rating-desc') return (b.liveRating?.rating || 0) - (a.liveRating?.rating || 0);
        if (sortBy === 'range-desc') return b.rangeKm - a.rangeKm;
        return 0;
      });
  }, [normalizedRentals, selectedType, maxHourlyPrice, minRating, maxDistanceFilter, searchQuery, sortBy, userHub]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const totalPages = Math.ceil(filteredRentals.length / (pageSize === 'all' ? (filteredRentals.length || 1) : pageSize));
  const displayedRentals = useMemo(() => {
    if (pageSize === 'all') return filteredRentals;
    const start = (currentPage - 1) * pageSize;
    return filteredRentals.slice(start, start + pageSize);
  }, [filteredRentals, currentPage, pageSize]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white/95 space-y-4 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-extrabold uppercase tracking-wider mb-2">
              <KeyRound className="w-3.5 h-3.5" />
              Tamil Nadu Self-Drive & Bike Fleet
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hourly & Daily Vehicle & Bike Rentals
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Royal Enfield Classic 350, Ola S1 Pro EV, TVS Jupiter, Mahindra Thar 4x4, Swift, and Nexon EV. Keyless smartphone unlock & 100% free cancellation.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl shadow-xs">
            <span className="text-xs text-slate-500 font-bold">Fleet in TN:</span>
            <span className="text-sm font-extrabold text-amber-600">{filteredRentals.length} available</span>
          </div>
        </div>

        {/* Filter & Control Bar */}
        <div className="pt-4 border-t border-slate-100 space-y-4">

          {/* Location Proximity & GPS Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" />
                Find Near Location:
              </span>
              <select
                value={userHub.id}
                onChange={(e) => {
                  const found = TN_TRANSIT_HUBS.find(hub => hub.id === e.target.value);
                  if (found) {
                    setUserHub(found);
                    setIsUsingDeviceGps(false);
                    setSortBy('nearest');
                  }
                }}
                className="bg-white border border-amber-300 text-slate-900 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs cursor-pointer"
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
                    : 'bg-white hover:bg-amber-100 text-amber-800 border border-amber-300'
                }`}
                title="Use device GPS to calculate live vehicle proximity"
              >
                <Navigation className={`w-3.5 h-3.5 ${isUsingDeviceGps ? 'animate-pulse' : ''}`} />
                <span>{isUsingDeviceGps ? '📍 GPS Locked' : '📍 Near Me (GPS)'}</span>
              </button>
            </div>

            {/* Distance Filter Radius */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-600 font-bold">Max Radius:</span>
              {[
                { label: 'All', value: 'all' },
                { label: '≤ 3 km', value: '3' },
                { label: '≤ 5 km', value: '5' },
                { label: '≤ 15 km', value: '15' }
              ].map((rad) => (
                <button
                  key={rad.value}
                  onClick={() => setMaxDistanceFilter(rad.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    maxDistanceFilter === rad.value
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {rad.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Top Row: Type Pills & Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {vehicleTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedType === type
                      ? 'bg-amber-500 text-white shadow-xs scale-105'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {type === 'All' ? 'All Vehicles' : type}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Royal Enfield, Thar, Ola, Swift..."
                style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-400 shadow-xs transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Bottom Row: Max-Price Slider & Sorting Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
            
            {/* Max Price Slider (7 cols) */}
            <div className="lg:col-span-7 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                  Max Hourly Price Limit:
                </span>
                <span className="font-extrabold text-amber-600 departure-digit text-sm">
                  ₹{maxHourlyPrice} / hr
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="750"
                step="10"
                value={maxHourlyPrice}
                onChange={(e) => setMaxHourlyPrice(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>₹45/hr (Jupiter)</span>
                <span>₹95/hr (Enfield)</span>
                <span>₹450/hr (Thar)</span>
                <span>₹750/hr (Max)</span>
              </div>
            </div>

            {/* Sort Dropdown (5 cols) */}
            <div className="lg:col-span-5 flex items-center gap-2 sm:justify-end">
              <span className="text-xs text-slate-500 font-bold whitespace-nowrap flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-300 text-slate-900 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-xs"
              >
                <option value="nearest">📍 Nearest First (Proximity)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Highest Customer Rating</option>
                <option value="range-desc">Longest Driving Range</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div className="lg:col-span-12 flex items-center gap-1.5 pt-1 border-t border-slate-200 mt-1">
              <span className="text-xs text-slate-600 font-bold whitespace-nowrap">Min Rating:</span>
              {[
                { label: 'All', value: 0 },
                { label: '4.5+ Stars', value: 4.5 },
                { label: '4.8+ Stars', value: 4.8 },
                { label: '4.95+ Stars', value: 4.95 },
              ].map((rate) => (
                <button
                  key={rate.value}
                  onClick={() => setMinRating(rate.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                    minRating === rate.value
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {rate.value > 0 && <Star className={`w-3 h-3 ${minRating === rate.value ? 'fill-white text-white' : 'fill-amber-400 text-amber-500'}`} />}
                  <span>{rate.label}</span>
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* Vehicle Grid */}
      {filteredRentals.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-slate-200 bg-white space-y-3 shadow-sm">
          <KeyRound className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No vehicles or bikes found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try raising your maximum hourly price slider or selecting "All Vehicles".
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedRentals.map((car) => {
            const nameLower = (car.name || car.title || '').toLowerCase();
            const isBikeItem = car.type === 'Bike' || car.category === 'bike' || car.category === 'bike-rent' || nameLower.includes('enfield') || nameLower.includes('jupiter') || nameLower.includes('ola') || nameLower.includes('aerox');

            return (
              <div
                key={car.id}
                className="glass-panel rounded-3xl overflow-hidden border border-slate-200 bg-white hover:shadow-xl transition-all group flex flex-col justify-between"
              >
                {/* Image & Badges */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-slate-900 text-[10px] font-bold shadow-xs flex items-center gap-1">
                      {isBikeItem ? <Bike className="w-3 h-3 text-amber-600" /> : <Car className="w-3 h-3 text-blue-600" />}
                      {car.type}
                    </span>
                    {car.instantUnlock && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                        <Zap className="w-3 h-3 fill-white" />
                        Keyless Unlock
                      </span>
                    )}
                  </div>

                  {/* Star Rating Badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 text-xs shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span className="font-extrabold text-slate-900 departure-digit">{car.liveRating.rating}</span>
                    <span className="text-[10px] text-slate-500 font-bold">({car.liveRating.count})</span>
                  </div>

                  {/* Free Cancellation Pill */}
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded-xl bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Free Cancel</span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-amber-600 transition-colors">
                          {car.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{car.location}</span>
                        </p>

                        {/* Proximity Distance & Travel Time Badge */}
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold">
                          <Compass className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span>📍 {car.distanceKm} km away</span>
                          <span className="text-amber-400">•</span>
                          <span className="text-amber-700 font-medium">~{car.estimatedTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Range</span>
                        <span className="font-bold text-slate-800 departure-digit">{car.rangeKm} km</span>
                      </div>
                      <div className="border-x border-slate-200">
                        <span className="text-[10px] text-slate-400 font-semibold block">Seats / Capacity</span>
                        <span className="font-bold text-slate-800">{car.seats} {car.seats === 2 ? 'Riders' : 'Seats'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Drive / Fuel</span>
                        <span className="font-bold text-slate-800">{car.transmission}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Booking CTA */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-amber-600 departure-digit">
                          ₹{car.hourlyPrice}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">/ hr</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Cap: ₹{car.dailyPrice}/day
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Host Report Button */}
                      <button
                        onClick={() => setReportingHost({
                          name: car.hostName || car.name,
                          driverName: car.hostName || car.name,
                          role: 'host'
                        })}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 transition-colors"
                        title="Report Host (3-Strike Policy)"
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>

                      {/* Text Host Query Button */}
                      {onOpenChat && (
                        <button
                          onClick={() => onOpenChat({
                            name: car.hostName || car.name,
                            driverName: car.hostName || car.name,
                            vehicle: car.name,
                            vehicleModel: car.name,
                            title: car.name,
                            location: car.location
                          }, 'rental')}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 transition-colors"
                          title="Text Host for Query"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}

                      {/* Live Telemetry Radar */}
                      <button
                        onClick={() => setTrackingRental({
                          title: car.name,
                          vehicle: car.name,
                          driverName: car.hostName || 'Rental Fleet Hub',
                          rideOtp: '4892',
                          isOtpVerified: true,
                          from: car.location,
                          to: 'Tamil Nadu Highway Corridor',
                          pickupCoords: car.gpsLocation || { lat: 13.0827, lng: 80.2707 },
                          mode: 'Self-Drive Rental'
                        })}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 border border-slate-200 transition-colors"
                        title="View Fleet GPS Telemetry"
                      >
                        <Radio className="w-4 h-4" />
                      </button>

                      {/* Reserve & Schedule Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (onBookRental) {
                              onBookRental({
                                id: car.id,
                                targetId: car.id,
                                vehicleId: car.id,
                                mode: 'Self-Drive Rental',
                                title: car.name,
                                price: car.hourlyPrice * 4,
                                hourlyPrice: car.hourlyPrice,
                                details: `Self-Drive Rental • Instant Unlock • ${car.location}`,
                                driverOrHost: car.hostName || 'RideFlow Fleet Host',
                                vehicle: car.name,
                                vehicleType: car.type,
                                category: car.type,
                                seats: car.seats || (car.type === 'Bike' ? 1 : 4),
                                isScheduled: false,
                                rideOtp: '4892'
                              });
                            }
                          }}
                          className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          title="Instant Self-Drive Pickup"
                        >
                          <span>⚡ Now</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onBookRental) {
                              onBookRental({
                                id: car.id,
                                targetId: car.id,
                                vehicleId: car.id,
                                mode: 'Self-Drive Rental',
                                title: car.name,
                                price: car.hourlyPrice * 4,
                                hourlyPrice: car.hourlyPrice,
                                details: `Scheduled Self-Drive Rental • ${car.location}`,
                                driverOrHost: car.hostName || 'RideFlow Fleet Host',
                                vehicle: car.name,
                                vehicleType: car.type,
                                category: car.type,
                                seats: car.seats || (car.type === 'Bike' ? 1 : 4),
                                isScheduled: true,
                                scheduledDate: new Date().toISOString().split('T')[0],
                                scheduledTime: '10:00 AM',
                                rideOtp: '4892'
                              });
                            }
                          }}
                          className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          title="Schedule Rental for Date & Time"
                        >
                          <span>📅 Schedule</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          {/* Pagination Bar for 100+ Listings */}
          {filteredRentals.length > 0 && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="text-xs text-slate-600 font-medium">
                Showing <strong className="text-slate-900">{pageSize === 'all' ? 1 : (currentPage - 1) * pageSize + 1}</strong> – <strong className="text-slate-900">{pageSize === 'all' ? filteredRentals.length : Math.min(currentPage * pageSize, filteredRentals.length)}</strong> of <strong className="text-amber-600 font-extrabold">{filteredRentals.length} Verified Fleet Listings</strong>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Show:</span>
                {[12, 24, 'all'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => { setPageSize(sz); setCurrentPage(1); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                      pageSize === sz ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {sz === 'all' ? 'All (100+)' : sz}
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
                          currentPage === pageNum ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
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
        </div>
      )}

      {/* Host Incident Report Modal */}
      {reportingHost && (
        <ReportModal
          targetUser={reportingHost}
          onClose={() => setReportingHost(null)}
        />
      )}

      {/* Live GPS Telemetry Modal */}
      {trackingRental && (
        <LiveTrackingModal
          trip={trackingRental}
          onClose={() => setTrackingRental(null)}
          onOpenChat={onOpenChat}
        />
      )}

    </div>
  );
}
