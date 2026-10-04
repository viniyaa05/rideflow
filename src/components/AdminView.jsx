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
  Bike
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

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

  // Appeal resolution state
  const [appealNotes, setAppealNotes] = useState({});

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

  const handleSendSupportReply = (queryId) => {
    if (!replyText.trim()) return;
    resolveSupportQuery(queryId, replyText.trim());
    setReplyText('');
    setActiveReplyId(null);
    showNotification('✓ Support response transmitted to user ticket inbox.');
  };

  // 3-Strike aggregation: map strikes per user
  const strikeMap = {};
  userReports.forEach((r) => {
    const key = r.targetUserId || r.targetUserName;
    strikeMap[key] = (strikeMap[key] || 0) + 1;
  });

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
              Real-time regional oversight across Tamil Nadu. Live telemetry tracking, 3-strike user enforcement, appeals clearing, and passenger support desk.
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
            { id: 'telemetry', label: 'Central Fleet Radar', icon: Radio },
            { id: 'strikes', label: `3-Strike Reports (${userReports.length})`, icon: BadgeAlert },
            { id: 'appeals', label: `Appeals Inbox (${userAppeals.filter(a => a.status === 'pending').length} New)`, icon: UserX },
            { id: 'support', label: `Support Desk (${supportQueries.filter(q => q.status === 'pending').length} Open)`, icon: HelpCircle },
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
                {userReports.length} Incident Logs
              </span>
            </div>

            <div className="space-y-3">
              {userReports.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-slate-500 bg-slate-50 rounded-2xl">
                  No incident reports logged yet.
                </div>
              ) : (
                userReports.map((report) => {
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
                            Target: {report.targetUserName} ({report.targetUserRole})
                          </h4>
                          <span className="text-[10px] text-slate-400">• {new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>

                        <p className="text-xs font-bold text-rose-700">Reason: {report.reason}</p>
                        <p className="text-xs text-slate-600">"{report.description}"</p>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          Reported by Passenger ID: {report.reporterUserId} ({report.reporterName})
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
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                        >
                          Pardon
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
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
                {userAppeals.length} Total Appeals
              </span>
            </div>

            <div className="space-y-3">
              {userAppeals.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-slate-500 bg-slate-50 rounded-2xl">
                  No user appeals pending review.
                </div>
              ) : (
                userAppeals.map((appeal) => (
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
                            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold transition-colors"
                          >
                            Reject Appeal
                          </button>
                          <button
                            onClick={() => handleApproveAppeal(appeal.id)}
                            className="flex-1 sm:flex-none px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-colors"
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
          </div>
        </div>
      )}

      {/* TAB 4: SUPPORT DESK & USER QUERIES */}
      {activeAdminTab === 'support' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-indigo-200 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                  User Inquiries & Support Desk
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Direct messages from commuters and partner drivers. Provide assistance and resolve tickets.
                </p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold">
                {supportQueries.length} Inquiries Logged
              </span>
            </div>

            <div className="space-y-3">
              {supportQueries.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-slate-500 bg-slate-50 rounded-2xl">
                  No support tickets open.
                </div>
              ) : (
                supportQueries.map((query) => (
                  <div
                    key={query.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{query.subject}</h4>
                        <span className="text-[10px] text-slate-500">
                          From: {query.userName} ({query.userEmail}) • {new Date(query.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        query.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {query.status === 'resolved' ? '✓ Resolved' : '⏳ Open Ticket'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      "{query.message}"
                    </p>

                    {query.adminReply && (
                      <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900">
                        <strong className="block text-[10px] font-bold text-indigo-700 mb-0.5">Transmitted Admin Response:</strong>
                        {query.adminReply}
                      </div>
                    )}

                    {query.status !== 'resolved' && (
                      <div className="pt-2 border-t border-slate-100 flex gap-2">
                        <input
                          type="text"
                          placeholder="Type official response to user ticket..."
                          value={activeReplyId === query.id ? replyText : ''}
                          onChange={(e) => {
                            setActiveReplyId(query.id);
                            setReplyText(e.target.value);
                          }}
                          className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white"
                        />
                        <button
                          onClick={() => handleSendSupportReply(query.id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Reply & Resolve</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DRIVER ROSTER & RESTRICTIONS */}
      {activeAdminTab === 'drivers' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((driver) => (
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
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-1 transition-colors"
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
        </div>
      )}

      {/* TAB 6: REVIEW MODERATION */}
      {activeAdminTab === 'reviews' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
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
                    className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Review</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
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
