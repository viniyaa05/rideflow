import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, X, CheckCircle2, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ReportModal({ targetUser, onClose, onSuccess }) {
  const { reportUser } = useAuth();
  const [reason, setReason] = useState('Reckless / Aggressive Driving');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reportedStrikeCount, setReportedStrikeCount] = useState(0);

  const reasons = [
    'Reckless / Aggressive Driving',
    'Overcharging / Fare Dispute',
    'Unprofessional / Inappropriate Behavior',
    'Vehicle Mismatch / Poor Condition',
    'Unreasonable Delay / Trip Cancellation',
    'Security / Safety Violation'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const report = reportUser({
      targetUserId: targetUser?.id || targetUser?.userId || 'usr-sample',
      targetUserName: targetUser?.name || targetUser?.driverName || 'Reported Driver/Host',
      targetUserRole: targetUser?.role || targetUser?.type || 'driver',
      reason,
      description
    });

    setIsSubmitted(true);
    setReportedStrikeCount(report.reportedUserStrikes || 1);
    if (onSuccess) onSuccess(report);
    setTimeout(() => {
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-extrabold text-base text-slate-900">Report User or Driver</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-6 text-center space-y-3 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900">Incident Report Logged</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Your safety report has been logged. This user currently has{' '}
              <strong className="text-rose-600 font-bold">{reportedStrikeCount} strike{reportedStrikeCount > 1 ? 's' : ''}</strong> on record.
              {reportedStrikeCount >= 3 && ' User is now queued for immediate Admin suspension.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center text-rose-700 font-bold">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Target: {targetUser?.name || targetUser?.driverName || 'Alex Chen'}
                </p>
                <p className="text-[11px] text-slate-500">
                  RideFlow 3-Strike Safety Policy: 3 strikes lead to account suspension.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Incident Category</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400"
              >
                {reasons.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Incident Details</label>
              <textarea
                required
                rows={3}
                placeholder="Please describe what occurred during the trip..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-colors"
              >
                Submit Incident Report
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
