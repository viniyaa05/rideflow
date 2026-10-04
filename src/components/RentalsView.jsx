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
  Car
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLiveRating } from '../utils/ratings';
import ReportModal from './ReportModal';
import LiveTrackingModal from './LiveTrackingModal';

export default function RentalsView({ onBookRental, onOpenChat }) {
  const { rentals, reviews } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [maxHourlyPrice, setMaxHourlyPrice] = useState(750);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('price-asc');
  
  // Modals
  const [reportingHost, setReportingHost] = useState(null);
  const [trackingRental, setTrackingRental] = useState(null);

  const vehicleTypes = ['All', 'Bikes & Scooters', 'Electric', 'SUV', 'Sedan', 'Hatchback'];

  // Filtering & Sorting logic
  const filteredRentals = useMemo(() => {
    return rentals
      .map((car) => ({
        ...car,
        liveRating: getLiveRating({
          reviews,
          targetType: 'rental',
          targetName: car.name,
          fallbackRating: car.rating,
          fallbackCount: car.reviews
        })
      }))
      .filter((car) => {
        if (selectedType === 'Bikes & Scooters') {
          if (car.type !== 'Bike' && car.category !== 'bike' && !car.name.toLowerCase().includes('enfield') && !car.name.toLowerCase().includes('jupiter') && !car.name.toLowerCase().includes('ola') && !car.name.toLowerCase().includes('aerox')) {
            return false;
          }
        } else if (selectedType !== 'All' && car.type !== selectedType) {
          return false;
        }

        if (car.hourlyPrice > maxHourlyPrice) {
          return false;
        }
        if (minRating > 0 && car.liveRating.rating < minRating) {
          return false;
        }
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesName = car.name.toLowerCase().includes(query);
          const matchesBrand = car.brand?.toLowerCase().includes(query);
          const matchesLocation = car.location?.toLowerCase().includes(query);
          if (!matchesName && !matchesBrand && !matchesLocation) {
            return false;
          }
        }
        return true;
      }).sort((a, b) => {
        if (sortBy === 'price-asc') return a.hourlyPrice - b.hourlyPrice;
        if (sortBy === 'price-desc') return b.hourlyPrice - a.hourlyPrice;
        if (sortBy === 'rating-desc') return b.liveRating.rating - a.liveRating.rating;
        if (sortBy === 'range-desc') return b.rangeKm - a.rangeKm;
        return 0;
      });
  }, [rentals, reviews, selectedType, maxHourlyPrice, minRating, searchQuery, sortBy]);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRentals.map((car) => {
            const isBikeItem = car.type === 'Bike' || car.category === 'bike' || car.name.toLowerCase().includes('enfield') || car.name.toLowerCase().includes('jupiter') || car.name.toLowerCase().includes('ola') || car.name.toLowerCase().includes('aerox');

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

                      {/* Live Telemetry Radar */}
                      <button
                        onClick={() => setTrackingRental({
                          title: car.name,
                          vehicle: car.name,
                          driverName: car.hostName || 'Rental Fleet Hub',
                          rideOtp: '4892',
                          isOtpVerified: true,
                          from: car.location,
                          to: 'Tamil Nadu Highway Corridor'
                        })}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 border border-slate-200 transition-colors"
                        title="View Fleet GPS Telemetry"
                      >
                        <Radio className="w-4 h-4" />
                      </button>

                      {/* Reserve Button */}
                      <button
                        onClick={() => {
                          if (onBookRental) {
                            onBookRental({
                              mode: 'Self-Drive Rental',
                              title: car.name,
                              price: car.hourlyPrice * 4,
                              details: `Self-Drive Rental • 4 hours • ${car.location}`,
                              driverOrHost: car.hostName || 'RideFlow Fleet Host',
                              vehicle: car.name,
                              rideOtp: '4892'
                            });
                          }
                        }}
                        className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1"
                      >
                        <span>Reserve</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
        />
      )}

    </div>
  );
}
