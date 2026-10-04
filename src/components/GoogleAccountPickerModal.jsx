import React, { useState } from 'react';
import { X, UserPlus, Shield, Check, ArrowRight } from 'lucide-react';

export const GOOGLE_PRESET_ACCOUNTS = [
  {
    id: 'g_1',
    name: 'Kaviniyaa',
    email: 'rideflow2026@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    roleLabel: 'RideFlow Official • Tamil Nadu Desk',
    walletBalance: 1250.00
  },
  {
    id: 'g_2',
    name: 'Alex Chen',
    email: 'alex.chen@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    roleLabel: 'Daily OMR Commuter (Sholinganallur)',
    walletBalance: 450.00
  },
  {
    id: 'g_3',
    name: 'Priya Sundaram',
    email: 'priya.sundaram@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    roleLabel: 'Verified Carpool Host (Cognizant Tidel)',
    walletBalance: 680.00
  }
];

export default function GoogleAccountPickerModal({ isOpen, onClose, onSelectAccount }) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [customError, setCustomError] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  if (!isOpen) return null;

  const handleAccountClick = (account) => {
    setSelectedAccountId(account.id);
    setTimeout(() => {
      onSelectAccount(account);
    }, 250);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    setCustomError('');

    if (!customEmail.trim() || !customEmail.includes('@')) {
      setCustomError('Please enter a valid Google email address (e.g. name@gmail.com).');
      return;
    }
    if (!customPassword || customPassword.length < 6) {
      setCustomError('Google account password must be at least 6 characters.');
      return;
    }

    const emailClean = customEmail.trim().toLowerCase();
    const displayName = customName.trim() || emailClean.split('@')[0];

    const customGoogleUser = {
      id: 'g_custom_' + Math.random().toString(36).substr(2, 8),
      name: displayName,
      email: emailClean,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=C9501F&color=fff`,
      roleLabel: 'Google Authenticated Member',
      walletBalance: 250.00
    };

    onSelectAccount(customGoogleUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-7 relative space-y-5 text-slate-900">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Google Branding Header */}
        <div className="space-y-2 pr-6">
          <div className="flex items-center gap-2.5">
            <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span className="font-bold text-slate-700 text-sm">Sign in with Google</span>
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Choose an account
          </h3>
          <p className="text-xs text-slate-500">
            to continue to <strong className="text-slate-800">RideFlow Tamil Nadu</strong>
          </p>
        </div>

        {/* Account List */}
        {!showCustomInput ? (
          <div className="space-y-2">
            {GOOGLE_PRESET_ACCOUNTS.map((acc) => {
              const isSelected = selectedAccountId === acc.id;
              return (
                <button
                  key={acc.id}
                  onClick={() => handleAccountClick(acc)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-300/40 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-900 truncate">{acc.name}</h4>
                        {acc.email === 'rideflow2026@gmail.com' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                            Official
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 truncate font-medium">{acc.email}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{acc.roleLabel}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Use Another Account Button */}
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full p-3 rounded-2xl border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/40 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer pt-3 mt-1"
            >
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>Use another Google account</span>
            </button>
          </div>
        ) : (
          /* Custom Google Account Form */
          <form onSubmit={handleCustomSubmit} className="space-y-3.5 animate-fade-in">
            {customError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                {customError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Google Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. yourname@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Google Account Password</label>
              <input
                type="password"
                required
                placeholder="Enter password (minimum 6 characters)"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomError('');
                }}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                Back to Account List
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Security Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-semibold">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            Google OAuth 2.0 Verified
          </span>
          <span>Privacy • Terms</span>
        </div>

      </div>
    </div>
  );
}
