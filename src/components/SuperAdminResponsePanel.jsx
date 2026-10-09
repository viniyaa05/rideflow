import React, { useState, useEffect } from 'react';
import { 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  HelpCircle, 
  User, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  Search, 
  Filter, 
  Bell, 
  ArrowRight, 
  UserCheck, 
  Radio, 
  Zap, 
  Check, 
  Mail, 
  Phone,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SEEDED_PERSONAS } from '../data/mockData';

export default function SuperAdminResponsePanel({ onNavigateToUserInbox }) {
  const { 
    user, 
    supportQueries, 
    resolveSupportQuery, 
    submitSupportQuery, 
    refreshSupportQueries, 
    notifications, 
    switchPersona 
  } = useAuth();

  // Inquiries filter & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'open' | 'resolved'
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Active Reply Composer State
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState('resolved');
  const [isSending, setIsSending] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  // Direct Message to Any User (Proactive messaging)
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'direct-message' | 'broadcast'
  const [directRecipient, setDirectRecipient] = useState(SEEDED_PERSONAS[1]?.id || 'usr_pooja_sundaram');
  const [directSubject, setDirectSubject] = useState('Official Transit Advisory');
  const [directMessage, setDirectMessage] = useState('');
  const [directCategory, setDirectCategory] = useState('Admin Advisory');

  // Network Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState('Tamil Nadu Corridor Highway Update');
  const [broadcastMessage, setBroadcastMessage] = useState('Toll-free express lane active on OMR Elevated Corridor due to evening commuter rush.');

  // Auto-select first ticket if none selected
  useEffect(() => {
    if (supportQueries.length > 0 && !selectedTicketId) {
      setSelectedTicketId(supportQueries[0].id);
    }
  }, [supportQueries, selectedTicketId]);

  // Quick Response Templates
  const QUICK_TEMPLATES = [
    {
      title: '✅ Refund Credited',
      text: 'Vanakkam! Your request has been approved and ₹150 has been credited directly back to your RideFlow Wallet balance. You can verify it under Wallet History.'
    },
    {
      title: '🚗 Driver Reassigned & Warned',
      text: 'Vanakkam! We have reviewed the incident with the driver partner and issued a formal performance strike. An alternate verified top-rated captain has been assigned.'
    },
    {
      title: '⚡ Corridor Route Expanded',
      text: 'Vanakkam! Thank you for the suggestion. We have on-boarded 12 new verified Bike Taxi and Carpool captains near your requested tech corridor.'
    },
    {
      title: '🛡️ Account Clearance & Appeal Approved',
      text: 'Vanakkam! Your appeal documentation has been verified by the Transport Safety Officer. The account restriction has been cleared with immediate effect.'
    },
    {
      title: '📄 GST Invoice Provided',
      text: 'Vanakkam! Your official GST input credit tax invoice with SAC 996412 has been processed and sent to your registered email address.'
    }
  ];

  const showNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 5000);
  };

  // Filtered queries list
  const filteredQueries = supportQueries.filter((q) => {
    if (statusFilter === 'open' && q.status === 'resolved') return false;
    if (statusFilter === 'resolved' && q.status !== 'resolved') return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = (q.userName || q.name || '').toLowerCase().includes(query);
      const matchEmail = (q.userEmail || q.email || '').toLowerCase().includes(query);
      const matchSubject = (q.subject || '').toLowerCase().includes(query);
      const matchMsg = (q.message || '').toLowerCase().includes(query);
      if (!matchName && !matchEmail && !matchSubject && !matchMsg) return false;
    }
    return true;
  });

  const activeTicket = supportQueries.find((q) => q.id === selectedTicketId) || filteredQueries[0] || null;

  // Handle Answer Submission to User Ticket
  const handleTransmitReply = async (e) => {
    e.preventDefault();
    if (!activeTicket) return;
    if (!replyMessage.trim()) {
      showNotice('✕ Please type an answer message before transmitting.');
      return;
    }

    setIsSending(true);
    try {
      await resolveSupportQuery(activeTicket.id, replyMessage.trim());
      showNotice(`✓ Official answer transmitted directly to ${activeTicket.userName} (${activeTicket.userEmail})! User received in-app notification.`);
      setReplyMessage('');
      if (refreshSupportQueries) {
        refreshSupportQueries();
      }
    } catch (err) {
      showNotice('✕ Error transmitting response: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Direct Proactive Message to Any User
  const handleSendDirectMessage = async (e) => {
    e.preventDefault();
    if (!directMessage.trim()) {
      showNotice('✕ Please type a message to dispatch.');
      return;
    }

    const targetUser = SEEDED_PERSONAS.find((p) => p.id === directRecipient) || {
      id: directRecipient,
      name: 'RideFlow Commuter',
      email: 'user@rideflow.in'
    };

    setIsSending(true);
    try {
      // Create a support query record that is immediately answered by Super Admin
      const q = await submitSupportQuery({
        userId: targetUser.id,
        userName: targetUser.name,
        userEmail: targetUser.email,
        category: directCategory,
        subject: `[Super Admin Desk] ${directSubject}`,
        message: 'Direct advisory initiated by Super Admin Console.'
      });

      if (q && q.id) {
        await resolveSupportQuery(q.id, directMessage.trim());
      }

      showNotice(`✓ Direct advisory successfully dispatched to ${targetUser.name}! In-app notification sent.`);
      setDirectMessage('');
    } catch (err) {
      showNotice('✕ Failed to dispatch direct message: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Switch persona to test view the answer from user's perspective
  const handleTestViewAsUser = (targetUserId) => {
    const target = SEEDED_PERSONAS.find((p) => p.id === targetUserId);
    if (target) {
      switchPersona(target);
      if (onNavigateToUserInbox) {
        onNavigateToUserInbox();
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Console Top Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              Live Super Admin Dispatch & Response Panel
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              User Q&A, Support Terminal & Direct Advisory Desk
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Super Admin master console for communicating directly with commuters and drivers. Answers are saved permanently to the database and transmitted in real-time to the user's notification tray.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (refreshSupportQueries) refreshSupportQueries();
                showNotice('✓ Inquiries reloaded from backend database.');
              }}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Refresh tickets from MongoDB"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <div className="px-4 py-2.5 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-extrabold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{supportQueries.filter(q => q.status !== 'resolved').length} Open Queries</span>
            </div>
          </div>
        </div>

        {/* Console Mode Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'tickets', label: `Answer User Inquiries (${supportQueries.length})`, icon: MessageSquare },
            { id: 'direct-message', label: 'Direct Message Any User', icon: Send },
            { id: 'broadcast', label: 'Broadcast Transit Advisory', icon: Radio }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs font-extrabold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button 
            onClick={() => setActionNotice('')}
            className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: ANSWER USER INQUIRIES & TICKETS (TWO-PANE TERMINAL) */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Pane: Inquiries Queue (5 Columns) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                Inquiry Feed Queue
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                {filteredQueries.length} of {supportQueries.length}
              </span>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user, email or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'All Inquiries' },
                  { id: 'open', label: '⏳ Open / Pending' },
                  { id: 'resolved', label: '✓ Answered' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStatusFilter(s.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      statusFilter === s.id
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tickets List */}
            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
              {filteredQueries.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl text-xs font-bold text-slate-400">
                  No inquiries matching filter.
                </div>
              ) : (
                filteredQueries.map((ticket) => {
                  const isSelected = selectedTicketId === ticket.id;
                  const isResolved = ticket.status === 'resolved';

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'bg-indigo-50/90 border-indigo-400 ring-2 ring-indigo-300/60 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            isResolved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {isResolved ? '✓ Resolved' : '⏳ Needs Answer'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 font-mono">
                            #{ticket.id.slice(-6)}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {ticket.date || 'Today'}
                        </span>
                      </div>

                      <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">
                        {ticket.subject}
                      </h4>

                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        "{ticket.message}"
                      </p>

                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-bold text-indigo-700 flex items-center gap-1">
                          <User className="w-3 h-3 text-indigo-500" />
                          {ticket.userName || ticket.name || 'Commuter'}
                        </span>
                        <span className="text-slate-400 truncate max-w-[140px]">
                          {ticket.userEmail || ticket.email}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Pane: Direct Answer & Response Terminal (7 Columns) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
            {activeTicket ? (
              <div className="space-y-5">
                
                {/* Active Inquiry Header & User Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-purple-50 border border-indigo-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                        TICKET #{activeTicket.id}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                        {activeTicket.subject}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        activeTicket.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {activeTicket.status === 'resolved' ? '✓ Answered & Resolved' : '⏳ Awaiting Super Admin'}
                      </span>
                    </div>
                  </div>

                  {/* Commuter Profile Summary */}
                  <div className="p-3 rounded-xl bg-white border border-indigo-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                        {(activeTicket.userName || 'C')[0]}
                      </div>
                      <div>
                        <h5 className="font-extrabold text-slate-900">{activeTicket.userName || 'Commuter'}</h5>
                        <p className="text-[10px] text-slate-500 font-mono">{activeTicket.userEmail || activeTicket.email}</p>
                      </div>
                    </div>

                    {/* Quick Button to preview experience as this user */}
                    {activeTicket.userId && (
                      <button
                        onClick={() => handleTestViewAsUser(activeTicket.userId)}
                        className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[11px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Switch to this commuter profile to view answer"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>View as this User</span>
                      </button>
                    )}
                  </div>

                  {/* User's Original Message */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      User Inquiry Query:
                    </span>
                    <p className="font-medium leading-relaxed">
                      "{activeTicket.message}"
                    </p>
                  </div>

                  {/* Existing Admin Response (If already resolved) */}
                  {activeTicket.adminReply && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                      <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Transmitted Official Admin Response:
                      </span>
                      <p className="font-medium leading-relaxed italic">
                        "{activeTicket.adminReply}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Response Composer */}
                <form onSubmit={handleTransmitReply} className="space-y-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-900 flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 text-indigo-600" />
                        Super Admin Response to User:
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Transmits to in-app notification & ticket log
                      </span>
                    </label>

                    {/* Quick Response Template Pills */}
                    <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto pb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
                        Quick Answers:
                      </span>
                      {QUICK_TEMPLATES.map((tmpl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setReplyMessage(tmpl.text)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-800 border border-slate-200 text-[10px] font-extrabold text-slate-700 whitespace-nowrap transition-colors cursor-pointer"
                        >
                          {tmpl.title}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={5}
                      placeholder="Type your official administrative answer to this user..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                      className="w-full p-4 rounded-2xl bg-white border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs leading-relaxed"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Transmits official safety signature & in-app bell notification</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSending || !replyMessage.trim()}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSending ? 'Transmitting...' : 'Transmit Answer to User'}</span>
                    </button>
                  </div>
                </form>

              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-extrabold text-slate-700">No Inquiry Selected</h4>
                <p className="text-xs text-slate-500">Select a ticket from the left queue to formulate and transmit an official response.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: DIRECT PROACTIVE ADVISORY TO ANY USER */}
      {activeTab === 'direct-message' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm max-w-4xl mx-auto">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-600" />
              Proactive Direct User Advisory Desk
            </h3>
            <p className="text-xs text-slate-600">
              Transmit an official administrative advisory, priority alert, or policy notice directly to any commuter or driver partner on the network.
            </p>
          </div>

          <form onSubmit={handleSendDirectMessage} className="space-y-4">
            
            {/* Recipient User Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Recipient User Persona:
                </label>
                <select
                  value={directRecipient}
                  onChange={(e) => setDirectRecipient(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                >
                  {SEEDED_PERSONAS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.roleLabel} • {p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Advisory Category:
                </label>
                <select
                  value={directCategory}
                  onChange={(e) => setDirectCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                >
                  <option value="Safety Notice">Transport Safety Notice</option>
                  <option value="Fare Adjustment">Wallet / Fare Credit</option>
                  <option value="Fleet Invitation">Partner Fleet Onboarding</option>
                  <option value="Verification Approved">KYC & Document Verification</option>
                  <option value="Admin Advisory">General Admin Advisory</option>
                </select>
              </div>
            </div>

            {/* Subject Line */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Subject Line:
              </label>
              <input
                type="text"
                value={directSubject}
                onChange={(e) => setDirectSubject(e.target.value)}
                placeholder="e.g. Important update regarding your OMR corridor booking..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Direct Message Body */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Official Message Content:
              </label>
              <textarea
                rows={4}
                value={directMessage}
                onChange={(e) => setDirectMessage(e.target.value)}
                placeholder="Type the message to be delivered directly to the user's notification drawer..."
                className="w-full p-3.5 bg-white border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Dispatches immediately with high priority to user's device inbox.
              </span>

              <button
                type="submit"
                disabled={isSending || !directMessage.trim()}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Dispatching...' : 'Dispatch Advisory to User'}</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* TAB 3: NETWORK BROADCAST TRANSIT ADVISORY */}
      {activeTab === 'broadcast' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm max-w-4xl mx-auto">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-600" />
              Tamil Nadu Network Broadcast Desk
            </h3>
            <p className="text-xs text-slate-600">
              Transmit urgent announcements, monsoon advisories, or corridor notices to all active users on the network.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Broadcast Headline:</label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Advisory Details:</label>
              <textarea
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full p-3.5 bg-white border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Broadcasts across Chennai, Coimbatore, Madurai & Trichy corridors.
              </span>

              <button
                type="button"
                onClick={() => {
                  showNotice(`✓ Network Broadcast transmitted: "${broadcastTitle}"!`);
                }}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Publish Corridor Broadcast</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
