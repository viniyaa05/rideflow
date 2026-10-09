import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Car, 
  KeyRound, 
  Users, 
  Search, 
  Filter, 
  Lock,
  TrendingUp,
  Activity,
  FileText,
  BadgeAlert,
  UserX,
  Sparkles,
  Key,
  DollarSign,
  Radio,
  Send,
  MessageSquare,
  HelpCircle,
  Clock,
  Compass,
  Check,
  Bike,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SuperAdminResponsePanel from './SuperAdminResponsePanel';

export default function AdminView() {
  const { 
    user, 
    drivers, 
    rentals, 
    carpools, 
    reviews, 
    adminIncidents, 
    userReports,
    userAppeals,
    supportQueries,
    refreshSupportQueries,
    flagUser,
    unflagUser,
    resolveAppeal,
    resolveSupportQuery,
    flagDriverOrCar, 
    removeReview 
  } = useAuth();

  const { t } = useLanguage();

  // Navigation tab state: 'overview' | 'telemetry' | 'strikes' | 'appeals' | 'support' | 'drivers' | 'reviews' | 'revenue'
  const [activeAdminTab, setActiveAdminTab] = useState('telemetry');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedDriverToFlag, setSelectedDriverToFlag] = useState(null);
  const [flagReason, setFlagReason] = useState('Overspeeding telemetry violation on OMR elevated highway');
  const [actionSuccess, setActionSuccess] = useState('');
  
  // Support reply state
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [supportReplies, setSupportReplies] = useState({});

  // Appeal resolution state
  const [appealNotes, setAppealNotes] = useState({});

  // Driver Roster Controls
  const [driverSearch, setDriverSearch] = useState('');
  const [driverSort, setDriverSort] = useState('rating-desc'); // 'rating-desc' | 'trips-desc' | 'name-asc' | 'flagged-first'
  const [driverStatusFilter, setDriverStatusFilter] = useState('all'); // 'all' | 'active' | 'flagged'
  const [driverPage, setDriverPage] = useState(1);
  const driverPageSize = 6;

  // 3-Strike Incident Controls
  const [strikeSearch, setStrikeSearch] = useState('');
  const [strikeFilter, setStrikeFilter] = useState('all'); // 'all' | 'critical'
  const [strikeSort, setStrikeSort] = useState('newest'); // 'newest' | 'strikes-desc'
  const [strikePage, setStrikePage] = useState(1);
  const strikePageSize = 5;

  // Appeals Controls
  const [appealSearch, setAppealSearch] = useState('');
  const [appealStatusFilter, setAppealStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [appealSort, setAppealSort] = useState('newest'); // 'newest' | 'oldest'
  const [appealPage, setAppealPage] = useState(1);
  const appealPageSize = 5;

  // Review Moderation Controls
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewSort, setReviewSort] = useState('lowest'); // 'lowest' | 'highest' | 'newest'
  const [reviewRatingFilter, setReviewRatingFilter] = useState('all'); // 'all' | 'critical' | '5' | '1'
  const [reviewPage, setReviewPage] = useState(1);
  const reviewPageSize = 6;

  // Simulated live fleet coordinates for radar map
  const [fleetVehicles, setFleetVehicles] = useState([
    { id: 'flt-1', name: 'Rajesh Kumar', type: 'bike', vehicle: 'Royal Enfield Hunter 350', plate: 'TN-07-DE-4892', city: 'Chennai OMR', speed: 44, x: 220, y: 140, status: 'In Transit', otp: '4892', isOtpVerified: true },
    { id: 'flt-2', name: 'Pooja Sundaram', type: 'car', vehicle: 'Tata Nexon EV Max', plate: 'TN-09-EV-8821', city: 'Chennai Central', speed: 38, x: 380, y: 180, status: 'Picking Up', otp: '7104', isOtpVerified: false },
    { id: 'flt-3', name: 'Karthik Raja', type: 'car', vehicle: 'Mahindra XUV700 AX7', plate: 'TN-38-KR-9901', city: 'Coimbatore TIDEL', speed: 52, x: 180, y: 260, status: 'In Transit', otp: '5539', isOtpVerified: true },
    { id: 'flt-4', name: 'Suresh Mani', type: 'bike', vehicle: 'TVS Jupiter 125', plate: 'TN-58-SM-3190', city: 'Madurai Temple', speed: 32, x: 490, y: 310, status: 'In Transit', otp: '9021', isOtpVerified: true },
    { id: 'flt-5', name: 'Ananya Deshmukh', type: 'car', vehicle: 'Hyundai Creta SX', plate: 'TN-14-AD-3310', city: 'Salem Highway', speed: 64, x: 320, y: 220, status: 'In Transit', otp: '3341', isOtpVerified: true },
  ]);

  // Telemetry radar simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setFleetVehicles((prev) =>
        prev.map((v) => ({
          ...v,
          speed: Math.floor(30 + Math.random() * 35),
          x: (v.x + (Math.random() - 0.48) * 3) % 680,
          y: (v.y + (Math.random() - 0.48) * 3) % 360,
        }))
      );
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const showNotification = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleFlagDriverSubmit = (e) => {
    e.preventDefault();
    if (!selectedDriverToFlag) return;
    flagDriverOrCar(selectedDriverToFlag.id, flagReason);
    showNotification(`✓ Driver ${selectedDriverToFlag.name} (${selectedDriverToFlag.licensePlate}) flagged and temporarily restricted.`);
    setSelectedDriverToFlag(null);
  };

  const handleModerateReview = (reviewId) => {
    removeReview(reviewId);
    showNotification('✓ Public review removed from network feed.');
  };

  const handleApproveAppeal = (appealId) => {
    const note = appealNotes[appealId] || 'Reinstatement approved by Super Admin after review.';
    resolveAppeal(appealId, 'approved', note);
    showNotification('✓ Appeal approved! User flags have been cleared and account reinstated.');
  };

  const handleRejectAppeal = (appealId) => {
    const note = appealNotes[appealId] || 'Appeal denied due to repeated safety infractions.';
    resolveAppeal(appealId, 'rejected', note);
    showNotification('✕ Appeal rejected. Account remains flagged.');
  };

  useEffect(() => {
    if (activeAdminTab === 'support' && refreshSupportQueries) {
      refreshSupportQueries();
    }
  }, [activeAdminTab]);

  const handleSendSupportReply = async (queryId) => {
    const text = (supportReplies[queryId] || replyText || '').trim();
    if (!text) return;
    await resolveSupportQuery(queryId, text);
    setSupportReplies((prev) => ({ ...prev, [queryId]: '' }));
    setReplyText('');
    setActiveReplyId(null);
    showNotification('✓ Official response transmitted to user ticket inbox & saved to database.');
    if (refreshSupportQueries) {
      refreshSupportQueries();
    }
  };

  // 3-Strike aggregation: map strikes per user
  const strikeMap = {};
  userReports.forEach((r) => {
    const key = r.targetUserId || r.targetUserName;
    strikeMap[key] = (strikeMap[key] || 0) + 1;
  });

  // Filtered & Paginated Drivers
  const filteredDrivers = drivers
    .filter((d) => {
      if (driverStatusFilter === 'active' && d.isFlagged) return false;
      if (driverStatusFilter === 'flagged' && !d.isFlagged) return false;
      if (driverSearch.trim()) {
        const q = driverSearch.toLowerCase();
        const matchName = (d.name || '').toLowerCase().includes(q);
        const matchPlate = (d.licensePlate || '').toLowerCase().includes(q);
        const matchModel = (d.vehicleModel || '').toLowerCase().includes(q);
        const matchCity = (d.city || '').toLowerCase().includes(q);
        if (!matchName && !matchPlate && !matchModel && !matchCity) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (driverSort === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
      if (driverSort === 'trips-desc') return (b.trips || 0) - (a.trips || 0);
      if (driverSort === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (driverSort === 'flagged-first') return (b.isFlagged ? 1 : 0) - (a.isFlagged ? 1 : 0);
      return 0;
    });
  const totalDriverPages = Math.ceil(filteredDrivers.length / driverPageSize) || 1;
  const displayedDrivers = filteredDrivers.slice((driverPage - 1) * driverPageSize, driverPage * driverPageSize);

  // Filtered & Paginated 3-Strike Incident Reports
  const filteredReports = userReports
    .filter((r) => {
      const strikeCount = strikeMap[r.targetUserId || r.targetUserName] || 1;
      if (strikeFilter === 'critical' && strikeCount < 3) return false;
      if (strikeSearch.trim()) {
        const q = strikeSearch.toLowerCase();
        const matchTarget = (r.targetUserName || r.targetName || '').toLowerCase().includes(q);
        const matchReason = (r.reason || '').toLowerCase().includes(q);
        const matchDesc = (r.description || '').toLowerCase().includes(q);
        const matchReporter = (r.reporterName || '').toLowerCase().includes(q);
        if (!matchTarget && !matchReason && !matchDesc && !matchReporter) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (strikeSort === 'strikes-desc') {
        const aCount = strikeMap[a.targetUserId || a.targetUserName] || 1;
        const bCount = strikeMap[b.targetUserId || b.targetUserName] || 1;
        return bCount - aCount;
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  const totalStrikePages = Math.ceil(filteredReports.length / strikePageSize) || 1;
  const displayedReports = filteredReports.slice((strikePage - 1) * strikePageSize, strikePage * strikePageSize);

  // Filtered & Paginated Appeals
  const filteredAppeals = userAppeals
    .filter((a) => {
      if (appealStatusFilter !== 'all' && a.status !== appealStatusFilter) return false;
      if (appealSearch.trim()) {
        const q = appealSearch.toLowerCase();
        const matchName = (a.userName || '').toLowerCase().includes(q);
        const matchEmail = (a.userEmail || '').toLowerCase().includes(q);
        const matchExp = (a.explanation || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchExp) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (appealSort === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  const totalAppealPages = Math.ceil(filteredAppeals.length / appealPageSize) || 1;
  const displayedAppeals = filteredAppeals.slice((appealPage - 1) * appealPageSize, appealPage * appealPageSize);

  // Filtered & Paginated Public Reviews
  const filteredReviews = reviews
    .filter((r) => {
      if (reviewRatingFilter === 'critical' && r.rating > 2) return false;
      if (reviewRatingFilter === '5' && r.rating !== 5) return false;
      if (reviewRatingFilter === '1' && r.rating !== 1) return false;
      if (reviewSearch.trim()) {
        const q = reviewSearch.toLowerCase();
        const matchUser = (r.userName || '').toLowerCase().includes(q);
        const matchTarget = (r.targetName || '').toLowerCase().includes(q);
        const matchComment = (r.comment || '').toLowerCase().includes(q);
        if (!matchUser && !matchTarget && !matchComment) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (reviewSort === 'lowest') return (a.rating || 0) - (b.rating || 0);
      if (reviewSort === 'highest') return (b.rating || 0) - (a.rating || 0);
      return new Date(b.date || 0) - new Date(a.date || 0);
    });
  const totalReviewPages = Math.ceil(filteredReviews.length / reviewPageSize) || 1;
  const displayedReviews = filteredReviews.slice((reviewPage - 1) * reviewPageSize, reviewPage * reviewPageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/50 space-y-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-300 text-indigo-800 text-xs font-black uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              RideFlow Super Admin Governance & Telemetry
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Transit Safety, Fleet Radar & Moderation Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Real-time regional oversight across Tamil Nadu. Live telemetry tracking, 3-strike user enforcement, appeals clearing, and passenger grievance resolution.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-indigo-200 px-4 py-2.5 rounded-2xl shadow-xs">
            <Key className="w-4 h-4 text-indigo-600" />
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Admin Access</span>
              <span className="text-xs font-black text-indigo-700 font-mono">
                {user?.isAdmin ? 'ROLE: SUPER_ADMIN (Verified)' : 'DEMO SUPER ADMIN'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Tabs Bar */}
        <div className="pt-4 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'support', label: `💬 Client Grievance Queue (${supportQueries.filter(q => q.status !== 'resolved').length} Open)`, icon: MessageSquare },
            { id: 'telemetry', label: 'Central Fleet Radar', icon: Radio },
            { id: 'strikes', label: `3-Strike Reports (${userReports.length})`, icon: BadgeAlert },
            { id: 'appeals', label: `Appeals Inbox (${userAppeals.filter(a => a.status === 'pending').length} New)`, icon: UserX },
            { id: 'drivers', label: `Driver Roster (${drivers.length})`, icon: Car },
            { id: 'reviews', label: `Reviews (${reviews.length})`, icon: FileText },
            { id: 'revenue', label: 'GST Ledger', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Success Toast */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-extrabold flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* TAB 1: CENTRAL FLEET TELEMETRY RADAR */}
      {activeAdminTab === 'telemetry' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-950 text-white space-y-4 shadow-2xl relative overflow-hidden">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="text-base font-extrabold text-white">
                    Tamil Nadu Corridor Live GPS Radar
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold">
                    5 ACTIVE FLEET NODES
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time movement tracking for Bike Taxis, Private Chauffeurs & Self-Drive Rentals across TN corridors.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> Bike Taxis
                </span>
                <span className="flex items-center gap-1.5 text-purple-400">
                  <span className="w-2 h-2 rounded-full bg-purple-400" /> Cars & Rentals
                </span>
              </div>
            </div>

            {/* Simulated GPS Canvas */}
            <div className="relative w-full h-[380px] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
              {/* Radar Grid Pattern */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#6366f1 1px, #020617 1px)',
                  backgroundSize: '32px 32px'
                }}
              />

              {/* Radar Sweep Animation */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[340px] h-[340px] rounded-full border border-cyan-500/20" />
                <div className="w-[220px] h-[220px] rounded-full border border-cyan-500/30" />
                <div className="w-[100px] h-[100px] rounded-full border border-cyan-500/40" />
              </div>

              {/* Fleet Nodes */}
              {fleetVehicles.map((v) => (
                <div
                  key={v.id}
                  style={{
                    transform: `translate(${v.x - 140}px, ${v.y - 140}px)`,
                    transition: 'transform 1.4s ease-out'
                  }}
                  className="absolute cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ring-2 ${
                      v.type === 'bike' 
                        ? 'bg-cyan-500 text-slate-950 ring-cyan-300' 
                        : 'bg-purple-600 text-white ring-purple-300'
                    }`}>
                      {v.type === 'bike' ? <Bike className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                    </span>

                    {/* Speed Badge */}
                    <span className="absolute -top-3 left-7 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[9px] font-mono font-bold text-cyan-300 whitespace-nowrap shadow-md">
                      {v.speed} km/h • {v.name.split(' ')[0]}
                    </span>

                    {/* Tooltip on Hover */}
                    <div className="hidden group-hover:block absolute top-9 left-0 z-20 w-48 p-2.5 rounded-xl bg-slate-950/95 border border-slate-700 text-white text-[11px] shadow-2xl space-y-1">
                      <p className="font-extrabold text-cyan-300">{v.name}</p>
                      <p className="text-[10px] text-slate-400">{v.vehicle} ({v.plate})</p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                        <span>OTP: <strong className="font-mono text-amber-400">{v.otp}</strong></span>
                        <span className="text-emerald-400">{v.isOtpVerified ? '✓ Verified' : 'Awaiting OTP'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fleet Telemetry Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {fleetVehicles.map((v) => (
                <div key={v.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      v.type === 'bike' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {v.type === 'bike' ? <Bike className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{v.name}</h5>
                      <span className="text-[10px] text-slate-400 font-mono block">{v.plate} • {v.city}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-cyan-400">{v.speed} km/h</span>
                    <span className="block text-[9px] text-emerald-400 font-bold">OTP: {v.otp}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: 3-STRIKE USER REPORTS & SUSPENSION */}
      {activeAdminTab === 'strikes' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-rose-200 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <BadgeAlert className="w-5 h-5 text-rose-600" />
                  3-Strike Safety Governance & Flagging Desk
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  When a driver or passenger receives 3 or more verified strikes, Admin can immediately suspend and restrict their platform access.
                </p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
                {filteredReports.length} of {userReports.length} Incidents
              </span>
            </div>

            {/* Search, Filter & Sort Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search target user, reason, or reporter..."
                  value={strikeSearch}
                  onChange={(e) => { setStrikeSearch(e.target.value); setStrikePage(1); }}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  {[
                    { id: 'all', label: 'All Incidents' },
                    { id: 'critical', label: '⚠️ 3+ Strikes (Critical)' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => { setStrikeFilter(f.id); setStrikePage(1); }}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        strikeFilter === f.id
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <select
                  value={strikeSort}
                  onChange={(e) => setStrikeSort(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="strikes-desc">Most Strikes First</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {displayedReports.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-slate-500 bg-slate-50 rounded-2xl">
                  No incident reports matching your search or filters.
                </div>
              ) : (
                displayedReports.map((report) => {
                  const strikeCount = strikeMap[report.targetUserId || report.targetUserName] || 1;
                  const isEligibleForSuspension = strikeCount >= 3;

                  return (
                    <div
                      key={report.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono text-[10px] font-black">
                            STRIKE #{report.reportedUserStrikes || strikeCount}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900">
                            Target: {report.targetUserName || report.targetName || 'User / Partner'} ({report.targetUserRole || report.targetRole || 'Driver'})
                          </h4>
                          <span className="text-[10px] text-slate-400">• {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : (report.date || 'Recent')}</span>
                        </div>

                        <p className="text-xs font-bold text-rose-700">Reason: {report.reason}</p>
                        <p className="text-xs text-slate-600">"{report.description}"</p>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          Reported by Passenger: {report.reporterName || 'Verified Rider'} {report.reporterUserId ? `(ID: ${report.reporterUserId})` : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-auto">
                        <button
                          onClick={() => {
                            flagUser(report.targetUserId, `3-Strike Suspension: ${report.reason}`);
                            showNotification(`✓ User ${report.targetUserName} suspended under 3-Strike Governance.`);
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                            isEligibleForSuspension
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md animate-pulse'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>{isEligibleForSuspension ? 'Suspend User (3 Strikes)' : 'Flag User'}</span>
                        </button>

                        <button
                          onClick={() => {
                            unflagUser(report.targetUserId);
                            showNotification(`✓ Cleared flags for user ${report.targetUserName}.`);
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                        >
                          Pardon
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            {filteredReports.length > 0 && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <span className="text-slate-600 font-medium">
                  Showing <strong className="text-slate-900">{(strikePage - 1) * strikePageSize + 1}</strong> – <strong className="text-slate-900">{Math.min(strikePage * strikePageSize, filteredReports.length)}</strong> of <strong className="text-rose-700 font-bold">{filteredReports.length} Reports</strong>
                </span>

                {totalStrikePages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setStrikePage((p) => Math.max(1, p - 1))}
                      disabled={strikePage === 1}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 font-bold text-slate-700 cursor-pointer"
                    >
                      Prev
                    </button>
                    <span className="px-2 font-bold text-slate-700">Page {strikePage} of {totalStrikePages}</span>
                    <button
                      onClick={() => setStrikePage((p) => Math.min(totalStrikePages, p + 1))}
                      disabled={strikePage === totalStrikePages}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 font-bold text-slate-700 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: USER APPEALS INBOX */}
      {activeAdminTab === 'appeals' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-amber-200 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <UserX className="w-5 h-5 text-amber-600" />
                  Account Reinstatement Appeals Inbox
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Review formal explanations submitted by suspended or flagged users. Approving clears their error records and restores booking privileges.
                </p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                {filteredAppeals.length} of {userAppeals.length} Appeals
              </span>
            </div>

            {/* Search, Filter & Sort Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search appealing user, email, or explanation..."
                  value={appealSearch}
                  onChange={(e) => { setAppealSearch(e.target.value); setAppealPage(1); }}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  {[
                    { id: 'all', label: 'All Appeals' },
                    { id: 'pending', label: '⏳ Pending' },
                    { id: 'approved', label: '✓ Approved' },
                    { id: 'rejected', label: '✕ Rejected' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => { setAppealStatusFilter(st.id); setAppealPage(1); }}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        appealStatusFilter === st.id
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <select
                  value={appealSort}
                  onChange={(e) => setAppealSort(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {displayedAppeals.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-slate-500 bg-slate-50 rounded-2xl">
                  No user appeals matching your search or filters.
                </div>
              ) : (
                displayedAppeals.map((appeal) => (
                  <div
                    key={appeal.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900">{appeal.userName}</span>
                        <span className="text-xs text-slate-500 font-mono">({appeal.userEmail})</span>
                        <span className="text-[10px] text-slate-400">• {new Date(appeal.createdAt).toLocaleDateString()}</span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        appeal.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : appeal.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {appeal.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                      <strong className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Appeal Explanation:</strong>
                      "{appeal.explanation}"
                    </div>

                    {appeal.evidenceUrl && (
                      <div className="text-[11px] text-indigo-600 font-bold">
                        Supporting Proof: <a href={appeal.evidenceUrl} target="_blank" rel="noreferrer" className="underline">{appeal.evidenceUrl}</a>
                      </div>
                    )}

                    {appeal.status === 'pending' && (
                      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2 justify-between">
                        <input
                          type="text"
                          placeholder="Admin review note (optional)..."
                          value={appealNotes[appeal.id] || ''}
                          onChange={(e) => setAppealNotes({ ...appealNotes, [appeal.id]: e.target.value })}
                          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleRejectAppeal(appeal.id)}
                            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Reject Appeal
                          </button>
                          <button
                            onClick={() => handleApproveAppeal(appeal.id)}
                            className="flex-1 sm:flex-none px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-colors cursor-pointer"
                          >
                            Approve & Lift Flag
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {filteredAppeals.length > 0 && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <span className="text-slate-600 font-medium">
                  Showing <strong className="text-slate-900">{(appealPage - 1) * appealPageSize + 1}</strong> – <strong className="text-slate-900">{Math.min(appealPage * appealPageSize, filteredAppeals.length)}</strong> of <strong className="text-amber-700 font-bold">{filteredAppeals.length} Appeals</strong>
                </span>

                {totalAppealPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setAppealPage((p) => Math.max(1, p - 1))}
                      disabled={appealPage === 1}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 font-bold text-slate-700 cursor-pointer"
                    >
                      Prev
                    </button>
                    <span className="px-2 font-bold text-slate-700">Page {appealPage} of {totalAppealPages}</span>
                    <button
                      onClick={() => setAppealPage((p) => Math.min(totalAppealPages, p + 1))}
                      disabled={appealPage === totalAppealPages}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 font-bold text-slate-700 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: SUPER ADMIN RESPONSE TERMINAL & USER Q&A */}
      {activeAdminTab === 'support' && (
        <SuperAdminResponsePanel />
      )}

      {/* TAB 5: DRIVER ROSTER & RESTRICTIONS */}
      {activeAdminTab === 'drivers' && (
        <div className="space-y-6 animate-fade-in">
          {/* Search, Filter & Sort Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search driver by name, vehicle, license plate, or city..."
                value={driverSearch}
                onChange={(e) => { setDriverSearch(e.target.value); setDriverPage(1); }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                {[
                  { id: 'all', label: 'All Drivers' },
                  { id: 'active', label: '✓ Active & Vetted' },
                  { id: 'flagged', label: '⚠️ Restricted' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => { setDriverStatusFilter(st.id); setDriverPage(1); }}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      driverStatusFilter === st.id
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <select
                value={driverSort}
                onChange={(e) => setDriverSort(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
              >
                <option value="rating-desc">Rating: High to Low</option>
                <option value="trips-desc">Most Trips Completed</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="flagged-first">Restricted First</option>
              </select>
            </div>
          </div>

          {displayedDrivers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs font-bold text-slate-400">
              No drivers found matching your search or filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                    driver.isFlagged
                      ? 'bg-rose-50/60 border-rose-300 ring-2 ring-rose-200'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={driver.avatar}
                          alt={driver.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{driver.name}</h4>
                          <span className="font-mono text-[10px] text-slate-500 font-bold block">{driver.licensePlate}</span>
                        </div>
                      </div>

                      {driver.isFlagged ? (
                        <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black uppercase">
                          Restricted
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                          Active & Vetted
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 font-medium">
                      {driver.vehicleModel} • {driver.trips} completed trips • {driver.rating}⭐
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-semibold">{driver.city || 'Tamil Nadu'}</span>
                    {!driver.isFlagged ? (
                      <button
                        onClick={() => setSelectedDriverToFlag(driver)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Flag / Restrict</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-rose-700 font-bold">Investigation Active</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {filteredDrivers.length > 0 && (
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shadow-2xs">
              <span className="text-slate-600 font-medium">
                Showing <strong className="text-slate-900">{(driverPage - 1) * driverPageSize + 1}</strong> – <strong className="text-slate-900">{Math.min(driverPage * driverPageSize, filteredDrivers.length)}</strong> of <strong className="text-indigo-700 font-bold">{filteredDrivers.length} Drivers</strong>
              </span>

              {totalDriverPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDriverPage((p) => Math.max(1, p - 1))}
                    disabled={driverPage === 1}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-bold text-slate-700 cursor-pointer"
                  >
                    Prev
                  </button>
                  <span className="px-2 font-bold text-slate-700">Page {driverPage} of {totalDriverPages}</span>
                  <button
                    onClick={() => setDriverPage((p) => Math.min(totalDriverPages, p + 1))}
                    disabled={driverPage === totalDriverPages}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-bold text-slate-700 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: REVIEW MODERATION */}
      {activeAdminTab === 'reviews' && (
        <div className="space-y-4 animate-fade-in">
          {/* Search, Filter & Sort Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search reviews by passenger name, driver, or feedback text..."
                value={reviewSearch}
                onChange={(e) => { setReviewSearch(e.target.value); setReviewPage(1); }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                {[
                  { id: 'all', label: 'All Reviews' },
                  { id: 'critical', label: '⚠️ ≤ 2 Stars' },
                  { id: '5', label: '5 ⭐' },
                  { id: '1', label: '1 ⭐' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => { setReviewRatingFilter(st.id); setReviewPage(1); }}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      reviewRatingFilter === st.id
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <select
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <option value="lowest">Lowest Rating First</option>
                <option value="highest">Highest Rating First</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {displayedReviews.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs font-bold text-slate-400">
              No reviews found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                        <span className="text-[10px] text-slate-400 block font-medium">Review for {rev.targetName}</span>
                      </div>
                      <span className="text-xs font-bold text-amber-500">⭐ {rev.rating}/5</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 font-medium">"{rev.comment}"</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{rev.date}</span>
                    <button
                      onClick={() => handleModerateReview(rev.id)}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Review</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {filteredReviews.length > 0 && (
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shadow-2xs">
              <span className="text-slate-600 font-medium">
                Showing <strong className="text-slate-900">{(reviewPage - 1) * reviewPageSize + 1}</strong> – <strong className="text-slate-900">{Math.min(reviewPage * reviewPageSize, filteredReviews.length)}</strong> of <strong className="text-amber-600 font-bold">{filteredReviews.length} Reviews</strong>
              </span>

              {totalReviewPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                    disabled={reviewPage === 1}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-bold text-slate-700 cursor-pointer"
                  >
                    Prev
                  </button>
                  <span className="px-2 font-bold text-slate-700">Page {reviewPage} of {totalReviewPages}</span>
                  <button
                    onClick={() => setReviewPage((p) => Math.min(totalReviewPages, p + 1))}
                    disabled={reviewPage === totalReviewPages}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-bold text-slate-700 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: REVENUE & GST LEDGER */}
      {activeAdminTab === 'revenue' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Official GST Compliance & Commission Ledger</h3>
              <p className="text-xs text-slate-500">State of Tamil Nadu Road Passenger Transport Tax (GSTIN: 33AAACR4921F1ZX)</p>
            </div>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              ✓ Tax Compliant
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600">Monthly Gross Passenger Fare Value (GMV)</span>
              <span className="font-bold text-slate-900">₹28,45,000.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600">Platform Commission Retained (10%)</span>
              <span className="font-bold text-purple-700">₹2,84,500.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600">Central GST (CGST @ 2.5%)</span>
              <span className="font-bold text-blue-700">₹71,125.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600">Tamil Nadu State GST (SGST @ 2.5%)</span>
              <span className="font-bold text-blue-700">₹71,125.00</span>
            </div>
            <div className="flex justify-between py-1 pt-2 font-black text-slate-900 text-sm">
              <span>Net Partner Driver & Host Payouts (85%)</span>
              <span className="text-emerald-700">₹24,18,250.00</span>
            </div>
          </div>
        </div>
      )}

      {/* Flag Driver Modal */}
      {selectedDriverToFlag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600">
                <BadgeAlert className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-slate-900">Flag & Restrict Driver</h3>
              </div>
              <button onClick={() => setSelectedDriverToFlag(null)} className="p-1 rounded-lg text-slate-400">
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Restricting <strong>{selectedDriverToFlag.name}</strong> ({selectedDriverToFlag.licensePlate}) will immediately remove their active listing from passenger dispatch until investigation concludes.
            </p>

            <form onSubmit={handleFlagDriverSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Flag / Violation</label>
                <textarea
                  rows={3}
                  required
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedDriverToFlag(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
                >
                  Confirm Restriction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
