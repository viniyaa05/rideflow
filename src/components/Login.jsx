import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Car, 
  Compass, 
  ShieldCheck, 
  Key, 
  Users, 
  Zap, 
  ShieldAlert, 
  ArrowLeft, 
  CheckCircle2,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Shield,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AppealModal from './AppealModal';
import SupportModal from './SupportModal';
import GoogleAccountPickerModal from './GoogleAccountPickerModal';

export default function Login({ onBackToLanding }) {
  const { 
    login, 
    loginAsAdmin,
    loginWithGoogle, 
    loginWithGithub, 
    signup, 
    personas, 
    isLoading, 
    requestPasswordReset, 
    resetPassword 
  } = useAuth();
  
  const { currentThemeMeta } = useTheme();
  const { t, currentLang, changeLanguage } = useLanguage();

  const [activeTab, setActiveTab] = useState('user'); // 'user' | 'admin'
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showDemoAccordion, setShowDemoAccordion] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Sign In / Sign Up Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  // Admin Form State
  const [adminData, setAdminData] = useState({
    email: 'admin@rideflow.tn.gov.in',
    password: 'admin123'
  });

  // Forgot password flow state
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1);
  const [generatedOtpHint, setGeneratedOtpHint] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (activeTab === 'admin') {
        await loginAsAdmin({ email: adminData.email, password: adminData.password });
      } else if (isSignUp) {
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
          setErrorMsg('Please complete all required fields.');
          return;
        }
        await signup(formData);
      } else {
        if (!formData.email || !formData.password) {
          setErrorMsg('Please enter your registered email and password.');
          return;
        }
        await login({ email: formData.email, password: formData.password });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleOAuthGoogle = () => {
    setErrorMsg('');
    setShowGoogleModal(true);
  };

  const handleGoogleAccountSelected = async (chosenAccount) => {
    setShowGoogleModal(false);
    setErrorMsg('');
    try {
      await loginWithGoogle(chosenAccount);
    } catch (err) {
      setErrorMsg('Google OAuth authentication failed.');
    }
  };

  const handleOAuthGithub = async () => {
    setErrorMsg('');
    try {
      await loginWithGithub();
    } catch (err) {
      setErrorMsg('GitHub OAuth authentication failed.');
    }
  };

  const handleSelectPersona = (p) => {
    setErrorMsg('');
    setFormData({
      ...formData,
      email: p.email,
      password: p.password
    });
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const delivery = await requestPasswordReset(resetEmail);
      setDeliveryInfo(delivery);
      setGeneratedOtpHint(delivery.otp);
      setResetOtp('');
      setResetStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch reset code.');
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const enteredOtp = (resetOtp || '').trim();
    if (!enteredOtp || enteredOtp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    // Strict validation: Reject any random number
    if (deliveryInfo && deliveryInfo.otp && enteredOtp !== String(deliveryInfo.otp).trim()) {
      setErrorMsg(`Invalid verification OTP. The code you entered does not match the 6-digit code dispatched to ${deliveryInfo.recipient || resetEmail}. Random or incorrect numbers are strictly rejected.`);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    try {
      await resetPassword(resetEmail, enteredOtp, newPassword);
      setResetSuccessMsg('✓ Exact OTP Verified! Password updated successfully in MongoDB. You can now log in.');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetStep(1);
        setResetSuccessMsg('');
        setDeliveryInfo(null);
        setResetOtp('');
        setFormData({ ...formData, email: resetEmail, password: newPassword });
      }, 1600);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 relative overflow-hidden selection:bg-purple-100 selection:text-purple-700">
      
      {/* Top Floating Return to Home Bar */}
      {onBackToLanding && (
        <div className="w-full max-w-4xl mb-4 flex items-center justify-between z-20">
          <button
            onClick={onBackToLanding}
            className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs flex items-center gap-2 shadow-xs transition-all hover:scale-105 active:scale-95 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-purple-600 group-hover:-translate-x-1 transition-transform" />
            <span>← {currentLang === 'ta' ? 'முகப்பு பக்கத்திற்கு திரும்பு' : 'Return to RideFlow Home Page'}</span>
          </button>

          <span className="text-xs text-slate-500 font-bold hidden sm:inline-block">
            Tamil Nadu Transit Network
          </span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="w-full max-w-4xl rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 z-10">
        
        {/* Left 5 Cols: Brand Visual Showcase */}
        <div className="md:col-span-5 p-8 bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight">RideFlow</span>
                <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                  TN Hub
                </span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-snug">
              Modern Multi-Modal Transit for Tamil Nadu
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Solo Bike Taxis, Private Chauffeurs, Hourly Self-Drive Rentals, Shared Carpools, and 4-digit OTP security.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="space-y-3 relative z-10 my-6">
            <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Direct MongoDB Connected Platform</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
              <Key className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>4-Digit Ride Start OTP & Driver Verification</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>3-Strike Safety Governance & Appeals Desk</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
              <Zap className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>Rapid Bike Taxi & Carpool Route Matching</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 relative z-10 pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setShowSupportModal(true)}
              className="hover:text-purple-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Admin Support Desk</span>
            </button>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Gateway
            </span>
          </div>
        </div>

        {/* Right 7 Cols: Clean Professional Authentication Form */}
        <div className="md:col-span-7 p-6 sm:p-8 space-y-5 bg-white flex flex-col justify-between">
          
          <div>
            {/* Top Bar: Portal Toggle & Language */}
            <div className="flex items-center justify-between gap-2 mb-4">
              {/* User vs Admin Gateway Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('user');
                    setErrorMsg('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'user' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Commuter / Partner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('admin');
                    setErrorMsg('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    activeTab === 'admin' ? 'bg-purple-600 text-white shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Super Admin</span>
                </button>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {['en', 'ta', 'hi'].map((l) => (
                  <button
                    key={l}
                    onClick={() => changeLanguage(l)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      currentLang === l ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {l === 'en' ? 'EN' : l === 'ta' ? 'தமிழ்' : 'हिंदी'}
                  </button>
                ))}
              </div>
            </div>

            {/* Heading & Subtitle */}
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {activeTab === 'admin'
                  ? 'Super Admin Portal'
                  : showForgotPassword
                  ? 'Reset Your Password'
                  : isSignUp
                  ? 'Create Your Account'
                  : 'Welcome to RideFlow'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {activeTab === 'admin'
                  ? 'Authorized administrator login for platform governance and moderation'
                  : showForgotPassword
                  ? 'Enter your registered email to receive an instant OTP code'
                  : isSignUp
                  ? 'Join thousands of commuters across Tamil Nadu. Saved securely to MongoDB.'
                  : 'Enter your verified account email and password to sign in.'}
              </p>
            </div>
          </div>

          {/* ERROR ALERT */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {showForgotPassword ? (
            <form onSubmit={resetStep === 1 ? handleRequestOtp : handleResetPasswordSubmit} className="space-y-3.5">
              {resetSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{resetSuccessMsg}</span>
                </div>
              )}

              {resetStep === 1 ? (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Registered Email Address or Phone Number
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="e.g. rideflow2026@gmail.com or 8072832066"
                        style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition-all shadow-xs"
                      />
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-[11px] text-slate-600 font-medium">
                    💡 An authentic 6-digit verification code will be generated and dispatched to your account credentials.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Security Dispatch Box */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/50 border border-amber-200/90 shadow-xs space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg ${deliveryInfo?.emailSent ? 'bg-emerald-600' : 'bg-amber-600'} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                            <span>Official Security Dispatch</span>
                            {deliveryInfo?.emailSent && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold border border-emerald-300">
                                ✓ Dispatched to Inbox
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-amber-900 font-bold truncate max-w-[210px] sm:max-w-xs">
                            To: <span className="font-mono text-slate-900">{deliveryInfo?.recipient || resetEmail}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950">
                        Valid 5 Mins
                      </span>
                    </div>

                    {/* Email Delivery Status Banner */}
                    {deliveryInfo?.emailSent ? (
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-medium flex items-center justify-between">
                        <span>✓ Email sent to <strong>{deliveryInfo?.dispatchedEmail || resetEmail}</strong></span>
                        <a
                          href="https://mail.google.com"
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1"
                        >
                          <span>Open Gmail ↗</span>
                        </a>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-amber-100/80 border border-amber-200 text-[10.5px] text-amber-950 leading-relaxed font-medium">
                        💡 <strong>Real Gmail Inbox Dispatch:</strong> To have Google deliver emails directly from <em>rideflow2026@gmail.com</em>, add your Google App Password to <code className="bg-amber-200 px-1 py-0.5 rounded text-slate-900 font-mono">.env</code> (<code className="bg-amber-200 px-1 py-0.5 rounded text-slate-900 font-mono">EMAIL_PASS</code>). Your authentic code is generated below for immediate verification!
                      </div>
                    )}

                    {/* Monospace Code Display */}
                    <div className="p-2.5 rounded-xl bg-white border border-amber-200/90 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs">
                      <div>
                        <div className="text-[10px] font-bold text-slate-500">
                          Dispatched 6-Digit OTP:
                        </div>
                        <div className="text-xl font-black font-mono tracking-widest text-slate-900 mt-0.5">
                          {deliveryInfo?.otp || generatedOtpHint}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => {
                            const code = deliveryInfo?.otp || generatedOtpHint;
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(code);
                            }
                            setCopiedOtp(true);
                            setTimeout(() => setCopiedOtp(false), 2000);
                          }}
                          className="flex-1 sm:flex-initial px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                          <span>{copiedOtp ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setResetOtp(deliveryInfo?.otp || generatedOtpHint)}
                          className="flex-1 sm:flex-initial px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-extrabold flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Auto-Fill</span>
                        </button>
                      </div>
                    </div>

                    {/* Dispatch Channels and WhatsApp */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 border-t border-amber-200/70 text-[10px] text-amber-900 font-semibold">
                      <span>Sender: <strong className="text-slate-800">rideflow2026@gmail.com</strong></span>
                      <a
                        href={`https://wa.me/918072832066?text=RideFlow%20Password%20Reset%20Verification%20OTP%20for%20${encodeURIComponent(deliveryInfo?.recipient || resetEmail)}%3A%20${deliveryInfo?.otp || generatedOtpHint}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-600" />
                        <span>Send to WhatsApp (+91 80728 32066)</span>
                      </a>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">6-Digit Verification OTP</label>
                      <span className="text-[10px] text-rose-600 font-bold">Strict matching enforced</span>
                    </div>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="••••••"
                        style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-center text-lg font-mono font-black tracking-widest text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">New Secure Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="•••••••• (Min 6 chars)"
                        style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition-all shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetStep(1);
                    setDeliveryInfo(null);
                    setResetOtp('');
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ← Back to Sign In
                </button>

                <div className="flex items-center gap-2">
                  {resetStep === 2 && (
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md shadow-purple-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    {resetStep === 1 ? 'Send Reset OTP ➔' : 'Confirm New Password ➔'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* PRIMARY AUTH FORM (SIGN IN / SIGN UP) */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* ADMIN MODE FORM */}
              {activeTab === 'admin' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={adminData.email}
                        onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                        placeholder="admin@rideflow.tn.gov.in"
                        style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-400 shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Admin Master Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={adminData.password}
                        onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                        placeholder="••••••••"
                        style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-400 shadow-xs"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* COMMUTER / PARTNER SIGN IN & SIGN UP */
                <>
                  {isSignUp && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Alex Chen"
                            style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-400 shadow-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone (+91)</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+91 98401 23456"
                            style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-400 shadow-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="yourname@gmail.com"
                        style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-400 shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">Password</label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(true);
                            setResetEmail(formData.email);
                          }}
                          className="text-[11px] font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-400 shadow-xs"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-md shadow-purple-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {isLoading 
                    ? 'Authenticating...' 
                    : activeTab === 'admin' 
                    ? 'Enter Super Admin Console' 
                    : isSignUp 
                    ? 'Register & Save to MongoDB' 
                    : 'Sign In to RideFlow'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Toggle between Sign In and Sign Up */}
              {activeTab === 'user' && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setErrorMsg('');
                    }}
                    className="text-xs font-bold text-slate-600 hover:text-purple-700 cursor-pointer"
                  >
                    {isSignUp ? (
                      <span>Already have an account? <strong className="text-purple-700 underline">Sign In</strong></span>
                    ) : (
                      <span>Don't have an account? <strong className="text-purple-700 underline">Create an Account</strong></span>
                    )}
                  </button>
                </div>
              )}

              {/* OAuth Social Logins */}
              {activeTab === 'user' && !isSignUp && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleOAuthGoogle}
                      className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOAuthGithub}
                      className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                      <span>GitHub</span>
                    </button>
                  </div>
                </div>
              )}

            </form>
          )}

          {/* SUBTLE COLLAPSED ACCORDION FOR DEMO TEST ACCOUNTS */}
          {activeTab === 'user' && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDemoAccordion(!showDemoAccordion)}
                className="w-full text-left flex items-center justify-between text-[11px] font-bold text-slate-500 hover:text-slate-800 py-1 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Demo Test Accounts (Click to Fast-Fill)</span>
                </span>
                {showDemoAccordion ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showDemoAccordion && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-2 animate-fade-in">
                  {personas.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPersona(p)}
                      className="p-2 rounded-xl text-left bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-900 truncate leading-tight">
                          {p.name.split(' ')[0]}
                        </p>
                        <span className="text-[9px] text-slate-500 block truncate">
                          {p.email.split('@')[0]}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <SupportModal onClose={() => setShowSupportModal(false)} />
      )}

      {/* Appeal Modal */}
      {showAppealModal && (
        <AppealModal onClose={() => setShowAppealModal(false)} />
      )}

      {/* Google Account Picker Modal */}
      <GoogleAccountPickerModal 
        isOpen={showGoogleModal} 
        onClose={() => setShowGoogleModal(false)} 
        onSelectAccount={handleGoogleAccountSelected} 
      />

    </div>
  );
}
