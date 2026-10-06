import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Car, 
  KeyRound, 
  Users, 
  Star, 
  Briefcase, 
  ShieldAlert, 
  LogOut, 
  X, 
  Wallet, 
  Sparkles, 
  PlusCircle, 
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  LayoutDashboard,
  ShieldCheck,
  Code2,
  Bot,
  Globe,
  Key,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, onOpenTokenInspector }) {
  const { user, jwtToken, logout, addWalletFunds, personas, switchPersona } = useAuth();
  const { mode, isDark, toggleTheme, currentThemeMeta } = useTheme();
  const { t, currentLang, changeLanguage, languages } = useLanguage();
  
  const [topUpAmount, setTopUpAmount] = useState('');
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  // Close sidebar on escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && window.innerWidth < 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  const isSuperAdmin = Boolean(
    user &&
    (user.id === 'usr_super_admin' || user.email?.toLowerCase() === 'admin@rideflow.in' || user.email?.toLowerCase() === 'admin@rideflow.tn.gov.in') &&
    (user.role === 'SUPER_ADMIN' || user.isAdmin === true)
  );

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, badge: null },
    { id: 'compare', label: t('compareAndBook'), icon: Compass, badge: 'Smart' },
    { id: 'rentals', label: t('rentals'), icon: KeyRound, badge: null },
    { id: 'drivers', label: t('drivers'), icon: Car, badge: null },
    { id: 'carpool', label: t('carpool'), icon: Users, badge: 'Popular' },
    { id: 'reviews', label: t('reviews'), icon: Star, badge: null },
    { id: 'partner', label: t('partnerHub'), icon: Briefcase, badge: 'Host' },
    ...(isSuperAdmin ? [{ id: 'admin', label: t('adminConsole'), icon: ShieldAlert, badge: 'Admin' }] : [])
  ];

  const handleTopUpSubmit = (e) => {
    e.preventDefault();
    if (!topUpAmount || Number(topUpAmount) <= 0) return;
    addWalletFunds(Number(topUpAmount));
    setTopUpSuccess(true);
    setTimeout(() => {
      setTopUpSuccess(false);
      setShowTopUpModal(false);
      setTopUpAmount('');
    }, 1200);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container with Responsive Sliding Transition */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Collapse Button */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              style={{ background: currentThemeMeta.accentHex }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md cursor-pointer hover:scale-105 transition-transform"
              onClick={() => {
                setActiveTab('dashboard');
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
            >
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  {t('appName')}
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  TN
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{t('appSubtitle')}</p>
            </div>
          </div>

          {/* Toggle / Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Collapse Sidebar"
            aria-label="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4 hidden lg:block" />
            <X className="w-4 h-4 lg:hidden" />
          </button>
        </div>

        {/* User Persona & Role Card */}
        <div className="p-4 mx-3 my-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 flex-shrink-0 bg-white"
              />
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">{user?.name || 'Alex Chen'}</h4>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 block truncate">{user?.roleLabel || user?.loyaltyTier || 'Member'}</span>
              </div>
            </div>

            <button
              onClick={() => setShowPersonaModal(true)}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold shadow-2xs transition-colors flex-shrink-0 cursor-pointer"
              title="Switch Persona"
            >
              Switch
            </button>
          </div>

          {/* JWT Token Chip in Sidebar */}
          {jwtToken && (
            <div 
              onClick={onOpenTokenInspector}
              className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                <Key className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                JWT Auth Token
              </span>
              <span className="font-mono text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Verified
              </span>
            </div>
          )}
        </div>

        {/* Wallet Balance & Instant Top-Up Card */}
        <div className="px-4 py-2">
          <div className="p-3.5 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white space-y-2.5 shadow-md border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-indigo-400" />
                RideFlow Wallet
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">INR Balance</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black departure-digit text-white">
                ₹{user?.walletBalance || 0}
              </div>
              <button
                onClick={() => setShowTopUpModal(true)}
                className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-extrabold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Top Up</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) {
                    setIsOpen(false);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon 
                    className="w-4 h-4" 
                    style={isActive ? { color: currentThemeMeta.accentHex } : { color: '#64748b' }} 
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.badge === 'Admin'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      : item.badge === 'REST API'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions: Dark/Light Mode Toggle + Sign Out */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Theme Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <div className="flex items-center gap-2">
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
              <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase">
              {isDark ? '🌙 Dark' : '☀️ Light'}
            </span>
          </button>

          {/* Logout Button */}
          <button
            onClick={() => {
              logout();
              if (window.innerWidth < 1024) setIsOpen(false);
            }}
            className="w-full py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 text-slate-700 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>{t('logout')}</span>
          </button>
        </div>

      </aside>

      {/* Wallet Top-Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowTopUpModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Add Wallet Credits</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Instant UPI & Net Banking top-up</p>
              </div>
            </div>

            {topUpSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center animate-fade-in">
                ✓ Credits added successfully!
              </div>
            ) : (
              <form onSubmit={handleTopUpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Enter Amount in Rupees (₹)</label>
                  <input
                    type="number"
                    min="50"
                    max="10000"
                    step="50"
                    required
                    placeholder="e.g. 500"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-400 focus:outline-none departure-digit"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[200, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmount(String(amt))}
                      className="py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  Pay via UPI / Card & Recharge
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Switch Persona Modal */}
      {showPersonaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowPersonaModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{t('selectPersona')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pre-seeded profiles with authentic roles</p>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {personas
                .filter((p) => p.id !== 'usr_super_admin' && p.role !== 'SUPER_ADMIN' && p.email?.toLowerCase() !== 'admin@rideflow.in')
                .map((p) => {
                const isCurrent = user?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchPersona(p.id);
                      setShowPersonaModal(false);
                      setIsOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-200/50 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 flex-shrink-0 bg-white"
                      />
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</h4>
                        <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold block">{p.roleLabel}</span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{p.description}</p>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-bold uppercase flex-shrink-0">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
