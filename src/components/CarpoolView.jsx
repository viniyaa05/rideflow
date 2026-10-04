import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  SlidersHorizontal, 
  Clock, 
  MapPin, 
  Star, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  PlusCircle, 
  ShieldCheck, 
  Leaf, 
  ArrowUpDown, 
  X,
  ChevronRight,
  Repeat,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CarpoolView({ onOpenChat, onJoinCarpool }) {
  const { user, carpools, addCarpoolRide } = useAuth();
  
  const [searchRoute, setSearchRoute] = useState('');
  const [recurringOnly, setRecurringOnly] = useState(false);
  const [maxSeatPrice, setMaxSeatPrice] = useState(300);
  const [sortBy, setSortBy] = useState('price-asc');

  // "Offer a Ride" Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerForm, setOfferForm] = useState({
    from: '',
    to: '',
    departureTime: '08:30 AM',
    isRecurring: true,
    recurringDays: 'Mon - Fri',
    pricePerSeat: 85,
    availableSeats: 3,
    vehicleModel: 'Maruti Suzuki Swift / Ertiga'
  });
  const [postSuccess, setPostSuccess] = useState('');

  // Filter & Sort Logic
  const filteredCarpools = useMemo(() => {
    return carpools.filter((ride) => {
      if (recurringOnly && !ride.isRecurring) {
        return false;
      }
      if (ride.pricePerSeat > maxSeatPrice) {
        return false;
      }
      if (searchRoute.trim()) {
        const query = searchRoute.toLowerCase();
        const matchesFrom = ride.from.toLowerCase().includes(query);
        const matchesTo = ride.to.toLowerCase().includes(query);
        const matchesHost = ride.hostName.toLowerCase().includes(query);
        if (!matchesFrom && !matchesTo && !matchesHost) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.pricePerSeat - b.pricePerSeat;
      if (sortBy === 'price-desc') return b.pricePerSeat - a.pricePerSeat;
      if (sortBy === 'rating-desc') return b.hostRating - a.hostRating;
      if (sortBy === 'time-asc') return a.departureTime.localeCompare(b.departureTime);
      return 0;
    });
  }, [carpools, recurringOnly, maxSeatPrice, searchRoute, sortBy]);

  const handleCreateOffer = (e) => {
    e.preventDefault();
    if (!offerForm.from.trim() || !offerForm.to.trim()) return;

    addCarpoolRide({
      from: offerForm.from,
      to: offerForm.to,
      departureTime: offerForm.departureTime,
      isRecurring: offerForm.isRecurring,
      recurringDays: offerForm.isRecurring ? offerForm.recurringDays : 'Single Trip',
      pricePerSeat: Number(offerForm.pricePerSeat),
      availableSeats: Number(offerForm.availableSeats),
      vehicleModel: offerForm.vehicleModel
    });

    setIsOfferModalOpen(false);
    setPostSuccess(`✓ Your ride from ${offerForm.from} to ${offerForm.to} is published live!`);
    setTimeout(() => setPostSuccess(''), 5000);

    setOfferForm({
      from: '',
      to: '',
      departureTime: '08:30 AM',
      isRecurring: true,
      recurringDays: 'Mon - Fri',
      pricePerSeat: 85,
      availableSeats: 3,
      vehicleModel: 'Maruti Suzuki Swift / Ertiga'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white/95 space-y-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-extrabold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" />
              RideFlow Connect Community • Tamil Nadu
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Carpool & Shared Commute
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Share daily commute routes with verified co-workers across Chennai, Coimbatore & Madurai.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOfferModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Offer a Ride</span>
            </button>
          </div>
        </div>

        {/* Post Success Banner */}
        {postSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-extrabold flex items-center gap-2 shadow-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{postSuccess}</span>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          
          {/* Top Row: Search + Recurring Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchRoute}
                onChange={(e) => setSearchRoute(e.target.value)}
                placeholder="Search route (e.g. Anna Nagar, OMR, Coimbatore)..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-400 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            {/* Recurring Only Toggle Pill */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={recurringOnly}
                  onChange={(e) => setRecurringOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
              <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-teal-600" />
                Office Commutes (Mon-Fri)
              </span>
            </div>

          </div>

          {/* Bottom Row: Max Per-Seat Price Slider & Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
            
            {/* Max Seat Price (7 cols) */}
            <div className="lg:col-span-7 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                  Max Price Per Seat:
                </span>
                <span className="font-extrabold text-teal-700 departure-digit text-sm">
                  ₹{maxSeatPrice} / seat
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                step="10"
                value={maxSeatPrice}
                onChange={(e) => setMaxSeatPrice(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>₹50/seat (Min)</span>
                <span>₹175/seat</span>
                <span>₹300/seat (Max)</span>
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
                className="bg-white border border-slate-300 text-slate-900 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer shadow-xs"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="time-asc">Earliest Departure</option>
                <option value="rating-desc">Top Rated Host</option>
              </select>
            </div>

          </div>

        </div>
      </div>

      {/* Carpool Listings Grid */}
      {filteredCarpools.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-slate-200 bg-white space-y-3 shadow-sm">
          <Users className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No carpools match your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your maximum seat price slider or clearing the search box.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCarpools.map((pool) => {
            const isFullyBooked = pool.availableSeats <= 0;
            const isMyPost = pool.postedByUserId === user?.id || pool.hostName?.includes(user?.name);
            return (
              <div
                key={pool.id}
                className={`glass-panel rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-5 bg-white ${
                  isMyPost
                    ? 'border-teal-400 shadow-md ring-2 ring-teal-200/50'
                    : isFullyBooked ? 'opacity-70 border-slate-200' : 'border-slate-200 hover:shadow-xl'
                }`}
              >
                <div>
                  {/* Host Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={pool.hostAvatar}
                        alt={pool.hostName}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-teal-100 bg-slate-100"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900">{pool.hostName}</h3>
                          {isMyPost ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-600 text-white shadow-xs">
                              Your Listing
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {pool.verifiedCompany}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-medium">
                          <span className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            {pool.hostRating}
                          </span>
                          <span>•</span>
                          <span>{pool.hostTrips} shared rides</span>
                        </div>
                      </div>
                    </div>

                    {/* Recurring badge */}
                    {pool.isRecurring ? (
                      <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-[11px] font-extrabold border border-teal-200 flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        Recurring
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold border border-slate-200">
                        One-off Trip
                      </span>
                    )}
                  </div>

                  {/* Route Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="text-slate-500 font-normal">From:</span>
                        <span>{pool.from}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500 flex-shrink-0" />
                        <span className="text-slate-500 font-normal">To:</span>
                        <span>{pool.to}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>{pool.departureTime} ({pool.recurringDays})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 justify-end font-bold">
                        <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{pool.co2SavedKg}kg CO₂ saved</span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Model & Live Seats Indicator */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-slate-600">
                      🚗 {pool.vehicleModel}
                    </span>

                    {isFullyBooked ? (
                      <span className="text-xs font-black text-red-600 px-2 py-0.5 rounded bg-red-50 border border-red-200">
                        Fully Booked
                      </span>
                    ) : (
                      <span className="text-xs font-extrabold text-teal-800 px-2 py-0.5 rounded bg-teal-50 border border-teal-200">
                        {pool.availableSeats} of {pool.totalSeats} seats open
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-teal-700 departure-digit">
                        ₹{pool.pricePerSeat}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">/ seat</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Fuel & tolls split</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenChat(pool, 'host')}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-teal-700 text-xs font-extrabold border border-slate-200 transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>

                    <button
                      disabled={isFullyBooked}
                      onClick={() => {
                        if (onJoinCarpool) {
                          onJoinCarpool({
                            carpoolId: pool.id,
                            hostUserId: pool.postedByUserId,
                            hostName: pool.hostName,
                            mode: 'Carpool Connect',
                            title: `Carpool with ${pool.hostName}`,
                            price: pool.pricePerSeat,
                            details: `${pool.from} ➔ ${pool.to} (${pool.departureTime}) • 1 Seat Reserved`
                          });
                        }
                      }}
                      className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>{isFullyBooked ? 'Full' : 'Reserve Seat'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* "Offer a Ride" Modal Form */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-2xl relative space-y-5">
            <button
              onClick={() => setIsOfferModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 bg-slate-100 border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Offer a Shared Ride</h3>
                <p className="text-xs text-slate-500">Post your commute for all RideFlow users to book</p>
              </div>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Departure Origin</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anna Nagar Tower Park"
                  value={offerForm.from}
                  onChange={(e) => setOfferForm({ ...offerForm, from: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destination</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OMR IT Expressway"
                  value={offerForm.to}
                  onChange={(e) => setOfferForm({ ...offerForm, to: e.target.value })}
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-400 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Departure Time</label>
                  <input
                    type="text"
                    value={offerForm.departureTime}
                    onChange={(e) => setOfferForm({ ...offerForm, departureTime: e.target.value })}
                    style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-400 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price Per Seat (₹)</label>
                  <input
                    type="number"
                    min="30"
                    max="400"
                    step="5"
                    value={offerForm.pricePerSeat}
                    onChange={(e) => setOfferForm({ ...offerForm, pricePerSeat: e.target.value })}
                    style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-400 shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Available Seats</label>
                  <select
                    value={offerForm.availableSeats}
                    onChange={(e) => setOfferForm({ ...offerForm, availableSeats: Number(e.target.value) })}
                    style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-400 shadow-xs"
                  >
                    <option value={1}>1 seat</option>
                    <option value={2}>2 seats</option>
                    <option value={3}>3 seats</option>
                    <option value={4}>4 seats</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Model</label>
                  <input
                    type="text"
                    value={offerForm.vehicleModel}
                    onChange={(e) => setOfferForm({ ...offerForm, vehicleModel: e.target.value })}
                    placeholder="Maruti Swift / Ertiga"
                    style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-400 shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Publish Carpool Live</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
