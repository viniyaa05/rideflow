import React, { useState } from 'react';
import { ShieldAlert, AlertCircle, X, CheckCircle2, Send, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AppealModal({ onClose, onSuccess }) {
  const { user, submitAppeal } = useAuth();
  const [explanation, setExplanation] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!explanation.trim()) {
      setErrorMsg('Please provide a detailed explanation of your situation.');
      return;
    }

    try {
      submitAppeal({
        userId: user?.id || 'usr-flagged',
        userName: user?.name || 'User',
        userEmail: user?.email || 'user@rideflow.in',
        explanation,
        evidenceUrl: evidenceUrl.trim() || undefined
      });

      setIsSubmitted(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit appeal.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-amber-600">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-extrabold text-base text-slate-900">Account Appeal & Governance</h3>
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
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900">Appeal Submitted to Admin</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Your appeal is now under review by the Super Admin team. If approved, your account flags will be lifted immediately.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Account Flagged / Suspension Notice</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Your account has received 3 or more safety strikes or has been flagged by Admin. You may submit an appeal below detailing the context to request an unban.
              </p>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Explanation & Justification <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Explain what happened and why this flag was mistaken or resolved..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supporting Link / Evidence URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/... or dashcam snippet link"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none shadow-xs"
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
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Official Appeal</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
