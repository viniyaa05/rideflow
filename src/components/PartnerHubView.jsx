import React, { useState } from 'react';
import { 
  Briefcase, 
  Car, 
  KeyRound, 
  Users, 
  PlusCircle, 
  CheckCircle2, 
  TrendingUp, 
  Wallet, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Sparkles, 
  ChevronRight, 
  Plus, 
  ListFilter, 
  Trash2,
  Upload,
  Image as ImageIcon,
  Bike
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { TN_LOCATIONS, SEEDED_PERSONAS, ADMIN_CREDENTIALS } from '../data/mockData';
import SuperAdminResponsePanel from './SuperAdminResponsePanel';

export default function PartnerHubView() {
  const { user, carpools, rentals, drivers, notifications, addRentalCar, addCarpoolRide, registerAsDriver, switchPersona } = useAuth();
  const { t, currentLang } = useLanguage();
  
  const [activePartnerTab, setActivePartnerTab] = useState('list-rental'); // 'list-rental' | 'offer-carpool' | 'register-driver' | 'my-listings' | 'admin-console'
  const [toastMessage, setToastMessage] = useState('');

  // 1. Rental Vehicle Form
  const [rentalForm, setRentalForm] = useState({
    name: 'Royal Enfield Classic 350',
    brand: 'Royal Enfield',
    category: 'bike',
    type: 'Bike',
    hourlyPrice: 95,
    dailyPrice: 650,
    rangeKm: 420,
    seats: 2,
    transmission: 'Manual',
    location: 'Chennai Central Railway Station (600003)',
    fuel: 'Petrol',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80'
  });

  // 2. Carpool Offer Form
  const [poolForm, setPoolForm] = useState({
    from: 'Anna Nagar Tower Park (600040)',
    to: 'OMR IT Expressway - Sholinganallur (600119)',
    departureTime: '08:30 AM',
    isRecurring: true,
    recurringDays: 'Mon - Fri',
    pricePerSeat: 85,
    availableSeats: 3,
    vehicleModel: 'Maruti Suzuki Swift / Ertiga'
  });

  // 3. Driver Registration Form
  const [driverForm, setDriverForm] = useState({
    name: user?.name || 'Alex Chen',
    vehicleModel: 'Royal Enfield Hunter 350',
    licensePlate: 'TN-07-DE-4892',
    category: 'bike',
    categoryName: 'RideFlow Bike Taxi Captain',
    city: 'Chennai',
    experienceYears: '4',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleImageUpload = (e, formType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result;
      if (typeof result === 'string') {
        if (formType === 'rental') {
          setRentalForm((prev) => ({ ...prev, image: result }));
        } else if (formType === 'driver') {
          setDriverForm((prev) => ({ ...prev, image: result }));
        }
        showToast(currentLang === 'ta' ? '✓ வாகனப் படம் வெற்றிகரமாக பதிவேற்றப்பட்டது!' : '✓ Vehicle image uploaded and verified!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRentalSubmit = async (e) => {
    e.preventDefault();
    await addRentalCar(rentalForm);
    showToast(`✓ Your ${rentalForm.name} is saved to database & listed in the Fleet!`);
    setActivePartnerTab('my-listings');
  };

  const handleCarpoolSubmit = async (e) => {
    e.preventDefault();
    await addCarpoolRide(poolForm);
    showToast(`✓ Carpool route from ${poolForm.from} to ${poolForm.to} saved to database & published!`);
    setActivePartnerTab('my-listings');
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    await registerAsDriver(driverForm);
    showToast(`✓ Congratulations Captain ${driverForm.name}! Registered & saved to database.`);
    setActivePartnerTab('my-listings');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white/95 space-y-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-extrabold uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" />
              {t('partnerPortalBadge')}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('partnerPortalTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-medium">
              {t('partnerPortalSubtitle')}
            </p>
          </div>

          {/* Partner Earnings Card */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('partnerEarnings')}</span>
              <p className="text-2xl font-black text-purple-700 departure-digit">₹18,450</p>
              <span className="text-[10px] text-emerald-700 font-bold">✓ {t('directBankDeposit')}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActivePartnerTab('list-rental')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activePartnerTab === 'list-rental'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>{t('listRentalTab')}</span>
          </button>

          <button
            onClick={() => setActivePartnerTab('offer-carpool')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activePartnerTab === 'offer-carpool'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t('offerCarpoolTab')}</span>
          </button>

          <button
            onClick={() => setActivePartnerTab('register-driver')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activePartnerTab === 'register-driver'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>{t('registerDriverTab')}</span>
          </button>

          <button
            onClick={() => setActivePartnerTab('my-listings')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activePartnerTab === 'my-listings'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>{t('activeListingsTab')} ({carpools.length + rentals.length})</span>
          </button>

          {/* Dedicated Super Admin Console Tab in Profile */}
          <button
            onClick={() => setActivePartnerTab('admin-console')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activePartnerTab === 'admin-console'
                ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span>Super Admin Console</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-rose-200 text-rose-900 font-black">
              Q&A DESK
            </span>
          </button>
        </div>
      </div>

      {/* Toast Banner */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-extrabold flex items-center gap-2 shadow-md animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TAB: SUPER ADMIN CONSOLE IN ADMIN PROFILE */}
      {activePartnerTab === 'admin-console' ? (
        <div className="space-y-6 animate-fade-in">
          {/* Admin Profile Identity Header */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                👑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">
                    Super Administrator Profile & Governance Desk
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-mono font-bold">
                    ROOT ACCESS
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Officer: <strong>{user?.name || 'Super Admin Officer'}</strong> ({user?.email || 'admin@rideflow.in'}) • Direct User Q&A Terminal
                </p>
              </div>
            </div>

            {(!user?.isAdmin && user?.role !== 'SUPER_ADMIN') ? (
              <button
                onClick={() => {
                  switchPersona(ADMIN_CREDENTIALS);
                  showToast('✓ Switched to Super Admin Officer (admin@rideflow.in)!');
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Switch to Super Admin Officer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Super Admin Authenticated</span>
              </div>
            )}
          </div>

          {/* Full Super Admin Interactive Q&A Response Panel */}
          <SuperAdminResponsePanel />
        </div>
      ) : activePartnerTab === 'my-listings' ? (
        <div className="space-y-6 animate-fade-in">
          
          {/* Passenger Bookings for Your Rides */}
          {notifications && notifications.length > 0 && (
            <div className="glass-panel p-6 rounded-3xl border border-purple-200 bg-purple-50/40 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span>Passenger Reservations on Your Rides ({notifications.length})</span>
                </h3>
                <span className="text-xs text-purple-800 font-bold">Live Activity</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 rounded-2xl bg-white border border-purple-100 shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={notif.senderAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                          alt={notif.senderName}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-100"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{notif.senderName}</h4>
                          <span className="text-[10px] text-slate-500 font-medium">{notif.time}</span>
                        </div>
                      </div>

                      <span className="text-xs font-extrabold text-emerald-700 departure-digit bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        +₹{notif.fare}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">{notif.message}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-semibold">
                        📞 Passenger: <strong className="text-slate-800">{notif.senderPhone}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                        {notif.mode}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Published Carpools */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <span>Active Carpool Listings ({carpools.length})</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">Visible to all signed-in accounts</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {carpools.map((pool) => {
                const isMine = pool.postedByUserId === user?.id || pool.hostName?.includes(user?.name);
                return (
                  <div
                    key={pool.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isMine
                        ? 'bg-teal-50/50 border-teal-300 ring-2 ring-teal-200/50'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{pool.hostName}</span>
                        {isMine && (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-black uppercase">
                            Posted by You
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-extrabold text-teal-700 departure-digit">
                        ₹{pool.pricePerSeat} / seat
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p className="font-semibold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-600" />
                        <span>{pool.from} ➔ {pool.to}</span>
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        Departure: <strong>{pool.departureTime}</strong> • {pool.availableSeats} of {pool.totalSeats} seats left
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Published Rentals */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <span>Self-Drive & Bike Rental Fleet ({rentals.length})</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">Visible to all signed-in accounts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rentals.map((car) => {
                const isMine = car.postedByUserId === user?.id || car.hostName?.includes(user?.name);
                return (
                  <div
                    key={car.id}
                    className={`p-4 rounded-2xl border transition-all overflow-hidden ${
                      isMine
                        ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-200/50'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {car.image && (
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-full h-28 object-cover rounded-xl mb-2"
                      />
                    )}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900">{car.name}</span>
                      {isMine && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-black uppercase">
                          Your Listing
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{car.type} • {car.location}</p>
                    <p className="text-sm font-extrabold text-amber-600 mt-2 departure-digit">₹{car.hourlyPrice} / hr</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        /* Forms Section */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Active Registration Form */}
          <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-6">
            
            {/* TAB 1: LIST MY VEHICLE FOR RENTAL */}
            {activePartnerTab === 'list-rental' && (
              <form onSubmit={handleRentalSubmit} className="space-y-4">
                <div className="flex items-center gap-2 text-amber-600">
                  <KeyRound className="w-5 h-5" />
                  <h3 className="text-base font-bold text-slate-900">{t('listVehicleFormTitle')}</h3>
                </div>
                <p className="text-xs text-slate-500">
                  {t('listVehicleFormSubtitle')}
                </p>

                {/* Vehicle Photo Upload Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-500" />
                      {t('vehiclePhotoLabel')}
                    </span>
                    <label className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t('chooseImageBtn')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'rental')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {rentalForm.image && (
                    <div className="relative h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={rentalForm.image}
                        alt="Vehicle Preview"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono font-bold">
                        Live Preview Verified
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('vehicleName')}</label>
                    <input
                      type="text"
                      required
                      value={rentalForm.name}
                      onChange={(e) => setRentalForm({ ...rentalForm, name: e.target.value })}
                      placeholder="e.g. Royal Enfield Classic 350 or Swift Dzire"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('categoryType')}</label>
                    <select
                      value={rentalForm.type}
                      onChange={(e) => setRentalForm({ 
                        ...rentalForm, 
                        type: e.target.value,
                        seats: e.target.value === 'Bike' ? 2 : 5,
                        hourlyPrice: e.target.value === 'Bike' ? 95 : 220
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="Bike">🏍️ Bike / Motorcycle (Enfield, Jupiter, Ola)</option>
                      <option value="Hatchback">🚗 Hatchback (Swift, Tiago, i10)</option>
                      <option value="Sedan">🚗 Sedan (Swift Dzire, Verna)</option>
                      <option value="SUV">🚙 SUV (Innova, Thar 4x4, Creta)</option>
                      <option value="Electric">⚡ Electric (Nexon EV, ZS EV)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('hourlyPrice')}</label>
                    <input
                      type="number"
                      min="40"
                      max="900"
                      required
                      value={rentalForm.hourlyPrice}
                      onChange={(e) => setRentalForm({ ...rentalForm, hourlyPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('dailyCap')}</label>
                    <input
                      type="number"
                      min="300"
                      max="5000"
                      required
                      value={rentalForm.dailyPrice}
                      onChange={(e) => setRentalForm({ ...rentalForm, dailyPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Transmission</label>
                    <select
                      value={rentalForm.transmission}
                      onChange={(e) => setRentalForm({ ...rentalForm, transmission: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('stationLocation')}</label>
                  <select
                    value={rentalForm.location}
                    onChange={(e) => setRentalForm({ ...rentalForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400"
                  >
                    {TN_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t('publishRentalBtn')}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* TAB 2: OFFER A CARPOOL */}
            {activePartnerTab === 'offer-carpool' && (
              <form onSubmit={handleCarpoolSubmit} className="space-y-4">
                <div className="flex items-center gap-2 text-teal-600">
                  <Users className="w-5 h-5" />
                  <h3 className="text-base font-bold text-slate-900">
                    {currentLang === 'ta' ? 'பகிர்வுப் பயணம் / கார்பூல் சலுகை' : currentLang === 'hi' ? 'कारपूल यात्रा की पेशकश करें' : 'Offer a Shared Commute / Carpool'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  {currentLang === 'ta' ? 'பணியிடத்திற்கு அல்லது ஊருக்குச் செல்லும்போது மற்ற பயணிகளை அழைத்துச் சென்று எரிபொருள் செலவைக் குறைக்கவும்.' : 'Driving to work or outstation? Take passengers along your route and cut your fuel costs by up to 75%.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('pickupOrigin')}</label>
                    <input
                      type="text"
                      required
                      value={poolForm.from}
                      onChange={(e) => setPoolForm({ ...poolForm, from: e.target.value })}
                      placeholder="e.g. Coimbatore Gandhipuram"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('dropoffDestination')}</label>
                    <input
                      type="text"
                      required
                      value={poolForm.to}
                      onChange={(e) => setPoolForm({ ...poolForm, to: e.target.value })}
                      placeholder="e.g. TIDEL Park Avinashi Rd"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {currentLang === 'ta' ? 'புறப்படும் நேரம்' : 'Departure Time'}
                    </label>
                    <input
                      type="text"
                      required
                      value={poolForm.departureTime}
                      onChange={(e) => setPoolForm({ ...poolForm, departureTime: e.target.value })}
                      placeholder="08:30 AM"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {currentLang === 'ta' ? 'கட்டணம் / இருக்கை (₹)' : 'Price / Seat (₹)'}
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="400"
                      required
                      value={poolForm.pricePerSeat}
                      onChange={(e) => setPoolForm({ ...poolForm, pricePerSeat: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {currentLang === 'ta' ? 'இருக்கைகள்' : 'Available Seats'}
                    </label>
                    <select
                      value={poolForm.availableSeats}
                      onChange={(e) => setPoolForm({ ...poolForm, availableSeats: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-400"
                    >
                      <option value={1}>1 Seat</option>
                      <option value={2}>2 Seats</option>
                      <option value={3}>3 Seats</option>
                      <option value={4}>4 Seats</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{currentLang === 'ta' ? 'கார்பூல் வழியை வெளியிடுங்கள்' : 'Publish Carpool Route'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* TAB 3: REGISTER AS A DRIVER OR BIKE TAXI */}
            {activePartnerTab === 'register-driver' && (
              <form onSubmit={handleDriverSubmit} className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <Car className="w-5 h-5" />
                  <h3 className="text-base font-bold text-slate-900">
                    {currentLang === 'ta' ? 'ஓட்டுநர் அல்லது பைக் டாக்ஸி கேப்டனாக பதிவு செய்க' : 'Register as a Driver or Bike Taxi Captain'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  {currentLang === 'ta' ? 'உங்கள் விருப்பப்படி முழுநேர அல்லது பகுதிநேர ஓட்டுநர். 85% நேரடி வருமானம்.' : 'Drive full-time or part-time on your schedule. 85% net passenger fare payout with zero commission surge cuts.'}
                </p>

                {/* Driver Vehicle Image Upload */}
                <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-500" />
                      {currentLang === 'ta' ? 'வாகன & உரிம சரிபார்ப்புப் படம்' : 'Vehicle & License Verification Image'}
                    </span>
                    <label className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t('chooseImageBtn')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'driver')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {driverForm.image && (
                    <div className="relative h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={driverForm.image}
                        alt="Driver Vehicle Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {currentLang === 'ta' ? 'கேப்டன் பெயர்' : 'Captain Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={driverForm.name}
                      onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {currentLang === 'ta' ? 'சேவை வகை' : 'Service Dispatch Category'}
                    </label>
                    <select
                      value={driverForm.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        setDriverForm({
                          ...driverForm,
                          category: cat,
                          categoryName: cat === 'bike' ? 'RideFlow Bike Taxi Captain' : cat === 'xl' ? 'RideFlow XL Partner (Innova)' : 'RideFlow Sedan Partner',
                          vehicleModel: cat === 'bike' ? 'Royal Enfield Hunter 350' : cat === 'xl' ? 'Toyota Innova Crysta' : 'Maruti Suzuki Dzire'
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="bike">🏍️ Solo Bike Taxi Captain (Helmets & Rapid Rides)</option>
                      <option value="economy">🚗 Sedan Partner (Dzire / Etios)</option>
                      <option value="xl">🚙 XL Partner (Innova Crysta / Ertiga)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {currentLang === 'ta' ? 'வாகன மாடல் & பெயர்' : 'Vehicle Model & Make'}
                    </label>
                    <input
                      type="text"
                      required
                      value={driverForm.vehicleModel}
                      onChange={(e) => setDriverForm({ ...driverForm, vehicleModel: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {currentLang === 'ta' ? 'வாகன எண் (TN RTO)' : 'TN Commercial RTO Plate'}
                    </label>
                    <input
                      type="text"
                      required
                      value={driverForm.licensePlate}
                      onChange={(e) => setDriverForm({ ...driverForm, licensePlate: e.target.value })}
                      placeholder="e.g. TN-07-DE-4892"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{currentLang === 'ta' ? 'கேப்டன் பதிவை முடிக்கவும்' : 'Complete Captain Registration'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            )}

          </div>

          {/* Right 1 Col: Partner Benefits & Safety Policy */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-md">
              <h4 className="font-extrabold text-sm text-cyan-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('partnerGuaranteeTitle')}</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>{t('partnerPerk1')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>{t('partnerPerk2')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>{t('partnerPerk3')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>{t('partnerPerk4')}</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
