import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, Send, X, CheckCircle2, Headphones, Clock, Tag, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SupportModal({ onClose }) {
  const { user, submitSupportQuery, supportQueries, refreshSupportQueries } = useAuth();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Payment / Billing');
  const [message, setMessage] = useState('');
  const [guestName, setGuestName] = useState(() => localStorage.getItem('rideflow_support_guest_name') || '');
  const [guestEmail, setGuestEmail] = useState(() => localStorage.getItem('rideflow_support_guest_email') || '');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastTicketId, setLastTicketId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isSuperAdmin = Boolean(
    user && (
      user.role === 'SUPER_ADMIN' ||
      user.role === 'admin' ||
      user.isAdmin === true ||
      user.email?.toLowerCase() === 'admin@rideflow.in' ||
      user.email?.toLowerCase() === 'admin@rideflow.tn.gov.in' ||
      user.id === 'usr_super_admin' ||
      user.id === 'usr_admin_tn'
    )
  );

  // Live-sync fresh tickets and replies from MongoDB on modal open
  useEffect(() => {
    if (refreshSupportQueries) {
      refreshSupportQueries();
    }
  }, []);

  const categories = [
    'Payment / Billing',
    'Ride Cancellation & Refund',
    'Vehicle Rental Security Deposit',
    'Driver Conduct / Safety',
    'Partner Listing & Verification',
    'App Feature Request / Other'
  ];

  // Filter queries submitted by this user or guest email
  const activeEmail = (user?.email || guestEmail || '').trim().toLowerCase();
  const userTickets = supportQueries.filter((q) => {
    if (user?.id && q.userId === user.id) return true;
    if (activeEmail && q.userEmail?.toLowerCase() === activeEmail) return true;
    if (activeEmail && q.email?.toLowerCase() === activeEmail) return true;
    return false;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!subject.trim() || !message.trim()) {
      setErrorMsg('Please fill in both the subject and query message.');
      return;
    }

    const emailToSend = (user?.email || guestEmail).trim().toLowerCase();
    const nameToSend = (user?.name || guestName).trim() || 'Commuter';

    if (!user && !emailToSend) {
      setErrorMsg('Please enter your email address so the Admin can address your ticket.');
      return;
    }

    if (!user) {
      localStorage.setItem('rideflow_support_guest_email', emailToSend);
      localStorage.setItem('rideflow_support_guest_name', nameToSend);
    }

    try {
      const created = await submitSupportQuery({
        userId: user?.id || ('guest_' + Date.now()),
        userName: nameToSend,
        userEmail: emailToSend,
        category,
        subject: `[${category}] ${subject.trim()}`,
        message: message.trim()
      });

      setLastTicketId(created?.id || '');
      setIsSubmitted(true);
      setSubject('');
      setMessage('');
      if (refreshSupportQueries) {
        refreshSupportQueries();
      }
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit support query.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5 text-indigo-600">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-none">
                RideFlow Admin Support Desk
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Direct ticketing channel to the Super Admin Console
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 space-y-4 pr-1">
          {isSuperAdmin ? (
            <div className="py-8 px-4 text-center space-y-4 my-auto">
              <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
                <CheckCircle2 className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Super Admin Account Active
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed font-medium">
                  The Support Desk is reserved for clients and commuters to report issues to you. As an Administrator, you review, resolve, and reply to client complaints directly from the Super Admin Console rather than submitting tickets to yourself.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Close & Return
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Active / Past Tickets from this user */}
              {userTickets.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Your Registered Tickets ({userTickets.length})
                </span>
                <span className="text-[10px] text-indigo-600 font-bold">
                  {userTickets.filter(t => t.status === 'resolved').length} Resolved
                </span>
              </div>

              <div className="space-y-2.5">
                {userTickets.map((ticket) => (
                  <div key={ticket.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                            #{ticket.id}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900">{ticket.subject}</h5>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Logged: {new Date(ticket.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                        ticket.status === 'resolved' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {ticket.status === 'resolved' ? '✓ Resolved by Admin' : '⏳ In Admin Review'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100 font-medium">
                      "{ticket.message}"
                    </p>

                    {ticket.adminReply ? (
                      <div className="p-3 rounded-xl bg-indigo-50/90 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                        <div className="flex items-center gap-1.5 text-indigo-700 font-extrabold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Official Admin Answer:</span>
                        </div>
                        <p className="text-xs text-indigo-900 font-bold pl-5 leading-relaxed">
                          "{ticket.adminReply}"
                        </p>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 pl-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Awaiting Super Admin review in the Admin Console.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isSubmitted ? (
            <div className="py-5 text-center space-y-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 animate-fade-in">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-extrabold text-xs text-emerald-900">Support Ticket Token Registered!</h4>
              {lastTicketId && (
                <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-300 font-mono text-[11px] text-emerald-950 font-black">
                  Token: #{lastTicketId}
                </div>
              )}
              <p className="text-[11px] text-emerald-800 max-w-sm mx-auto leading-relaxed">
                Your ticket has been transmitted to the Admin Console. The Super Admin will review your query and reply directly. You will see their answer right here.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Register New Support Ticket
              </span>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                  {errorMsg}
                </div>
              )}

              {/* Guest Information (if unauthenticated) */}
              {!user && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Chen"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-400 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Email</label>
                    <input
                      type="email"
                      required
                      placeholder="you@gmail.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-400 shadow-2xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-400"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Refund query for Kovai carpool"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-400 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Message</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your issue or question in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-400 shadow-2xs"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Register Token</span>
                </button>
              </div>
            </form>
          )}
          </>
        )}
        </div>

      </div>
    </div>
  );
}

