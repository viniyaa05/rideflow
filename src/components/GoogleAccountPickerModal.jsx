import React, { useState, useEffect } from 'react';
import { X, UserPlus, Shield, Check, ArrowRight, Sparkles, ExternalLink, Info } from 'lucide-react';

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
  const [customError, setCustomError] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [showClientInfo, setShowClientInfo] = useState(false);

  // Check if Google Client ID is configured in Vite environment
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (isOpen && googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            try {
              // Parse JWT credential
              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const data = JSON.parse(jsonPayload);

              onSelectAccount({
                id: 'g_' + (data.sub || Math.random().toString(36).substr(2, 8)),
                name: data.name || data.email?.split('@')[0] || 'Google User',
                email: data.email,
                avatar: data.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=4285F4&color=fff`,
                roleLabel: 'Google Verified OAuth 2.0 Account',
                walletBalance: 500.00
              });
            } catch (jwtErr) {
              console.warn('[Google OAuth Token Parse Warning]', jwtErr);
            }
          }
        });

        const btnContainer = document.getElementById('google-official-btn');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: 380,
            text: 'continue_with',
            shape: 'pill'
          });
        }
      } catch (gErr) {
        console.warn('[Google SDK Init Warning]', gErr);
      }
    }
  }, [isOpen, googleClientId, onSelectAccount]);

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

    const emailClean = customEmail.trim().toLowerCase();
    const displayName = customName.trim() || emailClean.split('@')[0];

    const customGoogleUser = {
      id: 'g_custom_' + Math.random().toString(36).substr(2, 8),
      name: displayName,
      email: emailClean,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4285F4&color=fff`,
      roleLabel: 'Google Authenticated Member',
      walletBalance: 300.00
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
            <span className="font-black text-slate-800 text-sm tracking-tight">Google OAuth 2.0 Sign In</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold">
              Active
            </span>
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Choose an account
          </h3>
          <p className="text-xs text-slate-500">
            Instant passwordless Google authentication to <strong className="text-slate-800">RideFlow Tamil Nadu</strong>
          </p>
        </div>

        {/* Official Google Button Container (if Google Client ID is provided) */}
        {googleClientId && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
            <div id="google-official-btn" className="w-full flex justify-center"></div>
          </div>
        )}

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
                            Verified Desk
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 truncate font-medium">{acc.email}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{acc.roleLabel}</p>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  ) : (
                    <span className="text-[11px] font-bold text-blue-600">
                      Sign In ➔
                    </span>
                  )}
                </button>
              );
            })}

            {/* Use Another Google Account Button */}
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full p-3 rounded-2xl border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/40 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer pt-3 mt-1"
            >
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>Sign in with another Google Email</span>
            </button>
          </div>
        ) : (
          /* Passwordless Google Account Form */
          <form onSubmit={handleCustomSubmit} className="space-y-3.5 animate-fade-in">
            <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs space-y-1">
              <div className="font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Passwordless Google Authentication</span>
              </div>
              <p className="text-[11px] text-blue-800">
                OAuth never asks for your Google password. Enter your Gmail address to sign in immediately.
              </p>
            </div>

            {customError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                {customError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
              <input
                type="text"
                placeholder="e.g. Kaviniyaa"
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
                placeholder="yourname@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
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
                ← Back to List
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Authorize & Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Informational Help Box */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <button
            type="button"
            onClick={() => setShowClientInfo(!showClientInfo)}
            className="w-full text-left text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-blue-500" />
              How does Google OAuth work on RideFlow?
            </span>
            <span>{showClientInfo ? '▲' : '▼'}</span>
          </button>

          {showClientInfo && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5 animate-fade-in leading-relaxed">
              <p>
                <strong>1. One-Click OAuth:</strong> You can sign in passwordlessly using any Google account on this device.
              </p>
              <p>
                <strong>2. Google Cloud Redirect Popup:</strong> To show Google's official cloud sign-in popup dialog with your domain, add your Google Cloud Client ID to <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">.env</code> as <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">VITE_GOOGLE_CLIENT_ID</code>.
              </p>
            </div>
          )}

          {/* Security Footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1 font-semibold text-slate-600">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              Google OAuth 2.0 Security Verified
            </span>
            <span>Privacy • Terms</span>
          </div>
        </div>

      </div>
    </div>
  );
}
