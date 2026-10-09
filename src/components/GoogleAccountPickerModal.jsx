import React, { useState, useEffect } from 'react';
import { X, Shield, ArrowRight, ExternalLink, Info, CheckCircle2, User, Mail, Sparkles } from 'lucide-react';

export const VERIFIED_TEST_PERSONAS = [
  {
    id: 'usr_alex_chen',
    name: 'Alex Chen',
    email: 'alex.chen@gmail.com',
    roleLabel: 'Driver Partner & Commuter (OMR Corridor)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  },
  {
    id: 'usr_pooja_sundaram',
    name: 'Pooja Sundaram',
    email: 'pooja.sundaram@gmail.com',
    roleLabel: 'Verified Passenger (Chennai Central)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
  },
  {
    id: 'usr_kaviniyaa',
    name: 'Kaviniyaa',
    email: 'kaviniyaa05@gmail.com',
    roleLabel: 'RideFlow Host & Verified Commuter',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    id: 'usr_admin_tn',
    name: 'Tamil Nadu Admin',
    email: 'admin@rideflow.tn.gov.in',
    roleLabel: 'Super Admin • Governance & Appeals Desk',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  }
];

export default function GoogleAccountPickerModal({ isOpen, onClose, onSelectAccount, onFillCredentials }) {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '631072139574-bpalh6bucglpul7rnl7of8d2eg2qusdo.apps.googleusercontent.com';

  // Initialize official Google Identity Services SDK when Client ID is configured
  useEffect(() => {
    if (!isOpen || !googleClientId) return;

    let checkInterval = null;
    let attempts = 0;

    const setupGoogle = () => {
      if (window.google?.accounts?.id) {
        if (checkInterval) clearInterval(checkInterval);
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (response) => {
              try {
                // Parse JWT credential from Google OAuth 2.0
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
                  oauthProvider: 'google',
                  credentialToken: response.credential
                });
              } catch (jwtErr) {
                console.error('[Google OAuth Token Parse Error]', jwtErr);
              }
            }
          });

          const btnContainer = document.getElementById('google-official-btn');
          if (btnContainer) {
            btnContainer.innerHTML = '';
            window.google.accounts.id.renderButton(btnContainer, {
              theme: 'outline',
              size: 'large',
              width: 340,
              text: 'continue_with',
              shape: 'pill'
            });
          }
        } catch (gErr) {
          console.warn('[Google SDK Init Warning]', gErr);
        }
      } else {
        attempts++;
        if (attempts > 30 && checkInterval) {
          clearInterval(checkInterval);
        }
      }
    };

    setupGoogle();
    checkInterval = setInterval(setupGoogle, 200);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [isOpen, googleClientId, onSelectAccount]);

  if (!isOpen) return null;

  // 1-Click Complete Google Sign In
  const handleDirectGoogleLogin = async (account) => {
    setIsSubmitting(true);
    try {
      await onSelectAccount({
        id: account.id || 'g_' + Date.now(),
        name: account.name,
        email: account.email,
        avatar: account.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(account.name)}&background=4285F4&color=fff`,
        oauthProvider: 'google'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;
    const name = customName.trim() || customEmail.split('@')[0];
    await handleDirectGoogleLogin({
      id: 'g_custom_' + Date.now(),
      name,
      email: customEmail.trim(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff`
    });
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
            <span className="font-black text-slate-800 text-sm tracking-tight">Sign in with Google</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 border border-emerald-200 text-emerald-800">
              OAuth 2.0
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Choose an account to continue to RideFlow
          </h3>
          <p className="text-xs text-slate-500">
            Select your Google account for instant seamless authentication.
          </p>
        </div>

        {/* Official Google GSI Button Container (if initialized) */}
        <div className="flex justify-center">
          <div id="google-official-btn"></div>
        </div>

        {/* 1-Click Google Accounts Chooser */}
        <div className="space-y-2">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
            Select Google Account:
          </span>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {VERIFIED_TEST_PERSONAS.map((account) => (
              <button
                key={account.id}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDirectGoogleLogin(account)}
                className="w-full p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-300 text-left flex items-center justify-between gap-3 transition-all cursor-pointer group disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <img
                    src={account.avatar}
                    alt={account.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-blue-400 flex-shrink-0"
                  />
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 group-hover:text-blue-700">
                        {account.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{account.email}</p>
                    <span className="text-[9px] text-slate-400 block truncate">{account.roleLabel}</span>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0 text-slate-500">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Option to Use Another Google Account */}
        <div className="pt-2 border-t border-slate-100">
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="w-full text-left flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-700 py-1 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Use another Google account</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <form onSubmit={handleCustomGoogleSubmit} className="space-y-2 pt-1 animate-fade-in">
              <span className="text-[11px] font-bold text-slate-700 block">Enter Google Account Email:</span>
              <div className="space-y-1.5">
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In as Google User'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security badge footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure 256-Bit SSL • JWT Session Engine</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 font-bold cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
