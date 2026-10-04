import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Send, X, CheckCircle2, Headphones, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SupportModal({ onClose }) {
  const { user, submitSupportQuery, supportQueries } = useAuth();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Payment / Billing');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const categories = [
    'Payment / Billing',
    'Ride Cancellation & Refund',
    'Vehicle Rental Security Deposit',
    'Driver Conduct / Safety',
    'Partner Listing & Verification',
    'App Feature Request / Other'
  ];

  // Filter queries submitted by this user
  const userTickets = supportQueries.filter((q) => q.userId === user?.id || q.userEmail === user?.email);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!subject.trim() || !message.trim()) {
      setErrorMsg('Please fill in both the subject and query message.');
      return;
    }

    try {
      submitSupportQuery({
        userId: user?.id || 'usr-guest',
        userName: user?.name || 'RideFlow User',
        userEmail: user?.email || 'user@rideflow.in',
        subject: `[${category}] ${subject.trim()}`,
        message: message.trim()
      });

      setIsSubmitted(true);
      setSubject('');
      setMessage('');
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit support query.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2 text-indigo-600">
            <Headphones className="w-5 h-5" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-none">
                RideFlow Admin Support Desk
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Direct inquiry channel to the Super Admin team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 space-y-4 pr-1">
          {/* Active / Past Tickets from this user */}
          {userTickets.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Your Previous Tickets ({userTickets.length})
              </span>
              <div className="space-y-2">
                {userTickets.map((ticket) => (
                  <div key={ticket.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-900">{ticket.subject}</h5>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        ticket.status === 'resolved' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ticket.status === 'resolved' ? '✓ Resolved by Admin' : '⏳ In Review'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{ticket.message}</p>
                    {ticket.adminReply && (
                      <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-900 mt-1">
                        <strong className="block text-[10px] font-bold text-indigo-700">Admin Response:</strong>
                        {ticket.adminReply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isSubmitted ? (
            <div className="py-4 text-center space-y-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 animate-fade-in">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-extrabold text-xs text-emerald-900">Query Sent to Admin</h4>
              <p className="text-[11px] text-emerald-800">
                Ticket logged. Admin will review and reply directly in your Support Desk inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Submit a New Query
              </span>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                  {errorMsg}
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
                  placeholder="e.g. Refund query for cancelled Kovai carpool"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-400 shadow-xs"
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
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-400 shadow-xs"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Ticket</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
