import React, { useState } from 'react';
import { 
  Compass, 
  Car, 
  KeyRound, 
  Users, 
  Leaf, 
  TrendingUp, 
  Award, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  ShieldCheck, 
  ChevronRight,
  AlertCircle,
  XCircle,
  Wallet,
  Download,
  Star,
  Briefcase,
  Radio,
  Key,
  HelpCircle,
  ShieldAlert,
  Bike,
  Bell,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { MOCK_RECENT_TRIPS } from '../data/mockData';
import CancelModal from './CancelModal';
import ReviewModal from './ReviewModal';
import LiveTrackingModal from './LiveTrackingModal';
import ReportModal from './ReportModal';
import AppealModal from './AppealModal';
import SupportModal from './SupportModal';
import { downloadTripReceipt } from '../utils/pdfReceipt';
import { exportBookingsToCSV } from '../utils/exportBookings';

export default function Dashboard({ setActiveTab, onQuickBookRoute, onOpenChat }) {
  const { user, activeBookings, notifications, markNotificationAsRead, recentlyAccessed } = useAuth();
  const { currentThemeMeta } = useTheme();
  const { t } = useLanguage();

  // Modals state
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [reviewingItem, setReviewingItem] = useState(null);
  const [trackingTrip, setTrackingTrip] = useState(null);
  const [reportingUser, setReportingUser] = useState(null);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const stats = user?.stats || {
    totalTrips: 28,
    co2SavedKg: 84.5,
    moneySavedRupees: 2840,
    preferredMode: 'Carpool Connect'
  };

  const handleDownloadPDF = (booking) => {
    downloadTripReceipt(booking, user);
  };

  const unreadHostNotifs = notifications.filter((n) => !n.read && n.type === 'new_booking');
  const unreadSupportNotifs = notifications.filter((n) => !n.read && n.type === 'support_resolved');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Flagged / Suspension Notice for User */}
      {(user?.isFlagged || user?.strikes >= 3) && (
        <div className="p-4 rounded-3xl bg-amber-500/15 border border-amber-400 text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">
                Safety Notice: Account Has {user?.strikes || 3} Incident Strikes
              </h4>
              <p className="text-xs text-slate-600">
                Your account is currently under moderation review. You may submit an official appeal to the Super Admin.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAppealModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-sm transition-all whitespace-nowrap"
          >
            Submit Appeal
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Tamil Nadu Transit Member
              </span>
              <span className="text-xs text-slate-500 font-medium">| {user?.email}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t('greeting')}, <span style={{ color: currentThemeMeta.accentHex }}>{user?.name || 'Alex'}</span>
            </h1>
            <p className="text-sm text-slate-600 max-w-xl font-medium">
              {t('whereHeading')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowSupportModal(true)}
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Support Desk</span>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              style={{ background: currentThemeMeta.accentHex }}
              className="px-5 py-3 rounded-xl text-white font-extrabold text-sm shadow-sm hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 stroke-[2.5]" />
              <span>{t('planAndCompare')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Super Admin Support Answer Alert Banner */}
      {unreadSupportNotifs.length > 0 && (
        <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Support Desk: Super Admin replied to your ticket ({unreadSupportNotifs.length})</span>
              </h3>
            </div>
            <button
              onClick={() => setShowSupportModal(true)}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All in Support Desk</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unreadSupportNotifs.map((notif) => (
              <div
                key={notif.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{notif.time}</span>
                  </div>
                  {notif.reply ? (
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-[11px] text-emerald-950 dark:text-emerald-200">
                      <span className="font-extrabold text-[10px] text-emerald-700 dark:text-emerald-400 block mb-0.5">Official Response:</span>
                      "{notif.reply}"
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{notif.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      markNotificationAsRead(notif.id);
                      setShowSupportModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Open Ticket
                  </button>
                  <button
                    onClick={() => markNotificationAsRead(notif.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Host Passenger Reservation Alert Banner */}
      {unreadHostNotifs.length > 0 && (
        <div className="p-5 rounded-3xl bg-indigo-50/80 border border-indigo-200 shadow-xs space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-indigo-600" />
                <span>Host Notification: You have {unreadHostNotifs.length} new passenger reservation(s)</span>
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('partner')}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View in Partner Hub</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unreadHostNotifs.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-2xs flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={notif.senderAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                    alt={notif.senderName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 mt-0.5"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {notif.senderName} booked a seat
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">{notif.route}</p>
                    <p className="text-[10px] text-slate-600 font-bold mt-0.5">
                      Phone: <span className="text-indigo-700">{notif.senderPhone}</span> • Earned: <span className="text-emerald-700 font-extrabold departure-digit">+₹{notif.fare}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => markNotificationAsRead(notif.id)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer"
                >
                  Acknowledge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Accessed Routes Strip */}
      {recentlyAccessed && recentlyAccessed.length > 0 && (
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Recently Viewed Tamil Nadu Routes ({recentlyAccessed.length})
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {recentlyAccessed.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (onQuickBookRoute) {
                    onQuickBookRoute(item.from, item.to);
                  } else {
                    setActiveTab('compare');
                  }
                }}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-left transition-all flex items-center gap-3 whitespace-nowrap group shadow-2xs flex-shrink-0 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                  ➔
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-950 flex items-center gap-1.5">
                    <span>{item.from.split('(')[0].trim()}</span>
                    <span className="text-slate-400 font-normal">to</span>
                    <span>{item.to.split('(')[0].trim()}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Re-plan with live surge index</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Bookings Section */}
      {activeBookings && activeBookings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span>Your Active Bookings & Dispatches ({activeBookings.length})</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Convey your 4-digit Ride Start OTP to driver/host upon boarding.
              </p>
            </div>
            
            <button
              onClick={() => exportBookingsToCSV(activeBookings)}
              className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBookings.map((booking) => {
              const isCancelled = booking.status === 'Cancelled';
              return (
                <div
                  key={booking.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                    isCancelled
                      ? 'bg-slate-50 border-slate-200 opacity-80'
                      : 'bg-white border-blue-200/90 shadow-md ring-1 ring-blue-100'
                  }`}
                >
                  <div>
                    {/* Top Row: Mode & Status Pill */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-extrabold text-blue-700 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                        {booking.mode}
                      </span>

                      {isCancelled ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1 border border-red-200">
                          <XCircle className="w-3.5 h-3.5" />
                          Cancelled (Refunded)
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {booking.status} • {booking.pickupEta || 'In Transit'}
                        </span>
                      )}
                    </div>

                    <h3 className={`text-sm font-bold ${isCancelled ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {booking.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {booking.driverOrHost} • Ref: <span className="font-mono font-bold text-slate-700">{booking.id}</span>
                    </p>

                    {/* 4-Digit Ride Start OTP Banner */}
                    {!isCancelled && (
                      <div className="my-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-200/70 text-amber-800 flex items-center justify-center font-bold">
                            <Key className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-extrabold text-amber-900 block">Ride Start OTP</span>
                            <span className="font-mono font-black text-amber-700 text-base tracking-widest">
                              {booking.rideOtp || '4892'}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] text-amber-800 font-bold bg-white px-2.5 py-1 rounded-xl border border-amber-300 shadow-2xs">
                          {booking.isOtpVerified ? '✓ Verified' : 'Share with Driver'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Row: Fare & Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Fare Paid</span>
                      <span className={`text-base font-extrabold departure-digit ${isCancelled ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        ₹{booking.fare}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Live GPS Map Tracking Action */}
                      {!isCancelled && (
                        <button
                          onClick={() => setTrackingTrip(booking)}
                          className="py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Radio className="w-3.5 h-3.5 animate-pulse" />
                          <span>Track Live GPS</span>
                        </button>
                      )}

                      {/* Text Driver / Host Direct Action */}
                      {!isCancelled && onOpenChat && (
                        <button
                          onClick={() => onOpenChat({
                            name: booking.driverOrHost?.split('(')[0]?.trim() || 'Captain',
                            driverName: booking.driverOrHost?.split('(')[0]?.trim() || 'Captain',
                            vehicle: booking.vehicle || booking.title,
                            vehicleModel: booking.vehicle || booking.title,
                            title: booking.title
                          }, booking.mode === 'Self-Drive Rental' ? 'rental' : 'driver')}
                          className="py-2 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                          title="Text Captain / Host"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                      )}

                      {/* PDF Receipt Download Button */}
                      <button
                        onClick={() => handleDownloadPDF(booking)}
                        className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Download Tax Invoice as PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-600" />
                        <span>PDF</span>
                      </button>

                      {/* Report Driver Button */}
                      {!isCancelled && (
                        <button
                          onClick={() => setReportingUser({
                            name: booking.driverOrHost?.split('(')[0]?.trim() || 'Driver',
                            driverName: booking.driverOrHost?.split('(')[0]?.trim() || 'Driver',
                            role: 'driver'
                          })}
                          className="py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1"
                          title="Report Driver (3-Strike Policy)"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Report</span>
                        </button>
                      )}

                      {/* Cancel Booking Button */}
                      {!isCancelled && (
                        <button
                          onClick={() => setCancellingBooking(booking)}
                          className="py-2 px-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 shadow-2xs"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Trips */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/90 bg-white/95 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Trips</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 departure-digit">
            {stats.totalTrips}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span>+4 this month</span> • 100% On-time
          </p>
        </div>

        {/* Stat 2: CO2 Saved */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/90 bg-white/95 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Carbon Offset</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 departure-digit">
            {stats.co2SavedKg} <span className="text-sm font-normal text-slate-500">kg</span>
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            Equivalent to 5 planted trees
          </p>
        </div>

        {/* Stat 3: Total Savings */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Savings</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="font-extrabold text-sm">₹</span>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 departure-digit">
            ₹{stats.moneySavedRupees || 2840}
          </p>
          <p className="text-[11px] text-amber-600 font-semibold">
            vs solo surge rides
          </p>
        </div>

        {/* Stat 4: Wallet Balance */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wallet Balance</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 departure-digit">
            ₹{user?.walletBalance || 0}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            Points: <span className="text-slate-800 font-bold">{user?.rewardPoints || 1420} pts</span>
          </p>
        </div>
      </div>

      {/* Mode Jump Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Planner */}
        <div
          onClick={() => setActiveTab('compare')}
          className="glass-panel-interactive p-5 rounded-2xl cursor-pointer group bg-white border border-slate-200 shadow-xs"
        >
          <div 
            style={{ backgroundColor: `${currentThemeMeta.accentHex}18`, color: currentThemeMeta.accentHex }}
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"
          >
            <Compass className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Compare & Book
            </h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Planner
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium">
            Search any Tamil Nadu route to compare all modes side-by-side.
          </p>
          <div style={{ color: currentThemeMeta.accentHex }} className="flex items-center text-xs font-bold gap-1">
            <span>Open Planner</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Rentals & Bikes */}
        <div
          onClick={() => setActiveTab('rentals')}
          className="glass-panel-interactive p-5 rounded-2xl cursor-pointer group bg-white border border-slate-200 shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <KeyRound className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              Self-Drive & Bikes
            </h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60">
              Cars & Bikes
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium">
            Innova, Thar 4x4, Swift, and Royal Enfield rentals with keyless unlock.
          </p>
          <div className="flex items-center text-xs font-bold text-amber-600 gap-1">
            <span>Browse Rentals</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Drivers & Bike Taxi */}
        <div
          onClick={() => setActiveTab('drivers')}
          className="glass-panel-interactive p-5 rounded-2xl cursor-pointer group bg-white border border-slate-200 shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Car className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Drivers & Bike Taxi
            </h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
              Solo & XL Cabs
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium">
            Vetted private chauffeurs and rapid solo Bike Taxis with live OTP tracking.
          </p>
          <div className="flex items-center text-xs font-bold text-blue-600 gap-1">
            <span>Book Captain</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Partner Hub */}
        <div
          onClick={() => setActiveTab('partner')}
          className="glass-panel-interactive p-5 rounded-2xl cursor-pointer group bg-white border border-slate-200 shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Partner Hub
            </h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Host Fleet
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium">
            Upload vehicle image & list your car or bike to earn daily income.
          </p>
          <div className="flex items-center text-xs font-bold text-indigo-600 gap-1">
            <span>List Vehicle</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* Recent Trips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {t('recentTrips')}
          </h2>
          <span className="text-xs text-slate-500 font-medium">Verified History</span>
        </div>

        <div className="space-y-3">
          {MOCK_RECENT_TRIPS.map((trip) => (
            <div
              key={trip.id}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                  {trip.mode.includes('Driver') ? <Car className="w-5 h-5" /> : trip.mode.includes('Bike') ? <Bike className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{trip.from} ➔ {trip.to}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{trip.id}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {trip.driverOrHost} • {trip.date} • {trip.distance}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <span className="text-sm font-extrabold text-slate-900 departure-digit">
                    ₹{trip.fare}
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-semibold">
                    Saved ₹{trip.saved}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReviewingItem({
                      targetType: trip.mode === 'Book a Driver' ? 'driver' : trip.mode === 'Self-Drive Rental' ? 'rental' : 'carpool',
                      targetName: trip.driverOrHost.split('(')[0].trim(),
                      targetModel: trip.driverOrHost
                    })}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-800 flex items-center gap-1 transition-colors border border-amber-200"
                  >
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>Review</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onQuickBookRoute) {
                        onQuickBookRoute(trip.from, trip.to);
                      } else {
                        setActiveTab('compare');
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1 transition-colors border border-slate-200"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Rebook</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancellation Modal */}
      {cancellingBooking && (
        <CancelModal
          booking={cancellingBooking}
          onClose={() => setCancellingBooking(null)}
        />
      )}

      {/* Review Submission Modal */}
      {reviewingItem && (
        <ReviewModal
          targetItem={reviewingItem}
          onClose={() => setReviewingItem(null)}
        />
      )}

      {/* Live GPS Radar & OTP Tracking Modal */}
      {trackingTrip && (
        <LiveTrackingModal
          trip={trackingTrip}
          onClose={() => setTrackingTrip(null)}
          onOpenChat={onOpenChat}
        />
      )}

      {/* 3-Strike Report Incident Modal */}
      {reportingUser && (
        <ReportModal
          targetUser={reportingUser}
          onClose={() => setReportingUser(null)}
        />
      )}

      {/* Account Appeal Modal */}
      {showAppealModal && (
        <AppealModal
          onClose={() => setShowAppealModal(false)}
        />
      )}

      {/* Admin Support Desk Modal */}
      {showSupportModal && (
        <SupportModal
          onClose={() => setShowSupportModal(false)}
        />
      )}

    </div>
  );
}
