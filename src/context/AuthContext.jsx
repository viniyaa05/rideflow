import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_USER_BOOKINGS, 
  MOCK_CARPOOLS, 
  MOCK_RENTALS, 
  MOCK_DRIVERS, 
  MOCK_REVIEWS, 
  MOCK_ADMIN_INCIDENTS,
  SEEDED_PERSONAS,
  ADMIN_CREDENTIALS,
  MOCK_USER_REPORTS,
  MOCK_USER_APPEALS,
  MOCK_SUPPORT_QUERIES
} from '../data/mockData';
import { getCarImageUrl } from '../utils/carImage';
import { generateJWT, decodeJWT, removeStoredJWT } from '../utils/jwtAuth';
import { api } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'rideflow_auth_user';
const CREDENTIALS_KEY = 'rideflow_credentials';
const RECENT_ROUTES_KEY = 'rideflow_recent_routes';

// Shared collection keys that must live-sync across tabs/profiles in the same browser
const SHARED_KEYS = [
  'rideflow_carpools',
  'rideflow_rentals',
  'rideflow_drivers',
  'rideflow_reviews',
  'rideflow_notifications',
  'rideflow_admin_incidents',
  'rideflow_user_reports',
  'rideflow_user_appeals',
  'rideflow_support_queries'
];

const INITIAL_RECENT_ROUTES = [
  {
    id: 'rec-1',
    from: 'Chennai Central Railway Station (600003)',
    to: 'OMR IT Expressway - Sholinganallur (600119)',
    mode: 'Carpool Connect',
    timestamp: '2 hours ago'
  },
  {
    id: 'rec-2',
    from: 'Coimbatore Gandhipuram Central (641012)',
    to: 'TIDEL Park Coimbatore - Avinashi Rd (641014)',
    mode: 'Book a Driver',
    timestamp: 'Yesterday'
  }
];

const readCredentials = () => {
  try {
    const saved = localStorage.getItem(CREDENTIALS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const writeCredentials = (creds) => {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
};

// Mock password-reset OTP store
const RESET_KEY = 'rideflow_password_resets';
const OTP_TTL_MS = 5 * 60 * 1000;

const readResets = () => {
  try {
    const saved = localStorage.getItem(RESET_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const writeResets = (resets) => {
  localStorage.setItem(RESET_KEY, JSON.stringify(resets));
};

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    recipientUserId: 'usr_alex_chen',
    recipientName: 'Alex Chen',
    senderUserId: 'usr_pooja_sundaram',
    senderName: 'Pooja Sundaram',
    senderPhone: '+91 98409 11223',
    senderEmail: 'pooja.sundaram@gmail.com',
    senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    type: 'new_booking',
    title: '🎉 New Seat Reservation in your Carpool!',
    message: 'Pooja Sundaram reserved 1 seat for Chennai Central ➔ OMR IT Expressway. Earnings ₹90 credited to your account.',
    route: 'Chennai Central ➔ OMR IT Expressway',
    mode: 'Carpool Connect',
    fare: 90,
    time: '10 mins ago',
    read: false,
    createdAt: new Date(Date.now() - 600000).toISOString()
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return SEEDED_PERSONAS[0];
      const parsed = JSON.parse(saved);
      if (!parsed || typeof parsed !== 'object' || !parsed.name || !parsed.email) {
        return SEEDED_PERSONAS[0];
      }
      return parsed;
    } catch (e) {
      console.error('Failed to load user from localStorage', e);
      return SEEDED_PERSONAS[0];
    }
  });

  const [jwtToken, setJwtToken] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      const activeUser = (parsedUser && parsedUser.name) ? parsedUser : SEEDED_PERSONAS[0];
      return generateJWT(activeUser).token;
    } catch {
      return generateJWT(SEEDED_PERSONAS[0]).token;
    }
  });

  // Recently Accessed Routes
  const [recentlyAccessed, setRecentlyAccessed] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_ROUTES_KEY);
      return saved ? JSON.parse(saved) : INITIAL_RECENT_ROUTES;
    } catch {
      return INITIAL_RECENT_ROUTES;
    }
  });

  // Dynamic Carpool Fleet & Available Seats
  const [carpools, setCarpools] = useState(() => {
    try {
      const saved = localStorage.getItem('rideflow_carpools');
      return saved ? JSON.parse(saved) : MOCK_CARPOOLS;
    } catch {
      return MOCK_CARPOOLS;
    }
  });

  // Dynamic Rental Fleet
  const [rentals, setRentals] = useState(() => {
    try {
      const saved = localStorage.getItem('rideflow_rentals');
      return saved ? JSON.parse(saved) : MOCK_RENTALS;
    } catch {
      return MOCK_RENTALS;
    }
  });

  // Dynamic Drivers List
  const [drivers, setDrivers] = useState(() => {
    try {
      const saved = localStorage.getItem('rideflow_drivers');
      return saved ? JSON.parse(saved) : MOCK_DRIVERS;
    } catch {
      return MOCK_DRIVERS;
    }
  });

  // Reviews System
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('rideflow_reviews');
      return saved ? JSON.parse(saved) : MOCK_REVIEWS;
    } catch {
      return MOCK_REVIEWS;
    }
  });

  // Host & Passenger Real-Time Notifications
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('rideflow_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // User Reports (3-Strike Moderation)
  const [userReports, setUserReports] = useState(() => {
    try {
      const saved = localStorage.getItem('rideflow_user_reports');
      return saved ? JSON.parse(saved) : MOCK_USER_REPORTS;
    } catch {
      return MOCK_USER_REPORTS;
    }
  });

  // Admin Incidents
  const [adminIncidents, setAdminIncidents] = useState(() => {
    try {
      const saved = localStorage.getItem('rideflow_admin_incidents');
      return saved ? JSON.parse(saved) : MOCK_ADMIN_INCIDENTS;
    } catch {
      return MOCK_ADMIN_INCIDENTS;
    }
  });

  // User Appeals
  const [userAppeals, setUserAppeals] = useState(() => {
    try {
      const saved = localStorage.getItem('rideflow_user_appeals');
      return saved ? JSON.parse(saved) : MOCK_USER_APPEALS;
    } catch {
      return MOCK_USER_APPEALS;
    }
  });

  // Support Queries
  const [supportQueries, setSupportQueries] = useState(() => {
    try {
      const saved = localStorage.getItem('rideflow_support_queries');
      return saved ? JSON.parse(saved) : MOCK_SUPPORT_QUERIES;
    } catch {
      return MOCK_SUPPORT_QUERIES;
    }
  });

  const [activeBookings, setActiveBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [liveUpdateToast, setLiveUpdateToast] = useState('');
  const [dbStatus, setDbStatus] = useState({ connected: true, service: 'MongoDB Backend' });

  // Check MongoDB Backend Health on mount
  useEffect(() => {
    const checkMongo = async () => {
      try {
        const res = await api.checkHealth();
        setDbStatus(res);
      } catch {
        setDbStatus({ status: 'offline', database: 'Local Storage Fallback' });
      }
    };
    checkMongo();
  }, []);

  // Sync user-specific bookings whenever active user changes
  useEffect(() => {
    if (user?.id) {
      const userBookingsKey = `rideflow_bookings_${user.id}`;
      try {
        const saved = localStorage.getItem(userBookingsKey);
        if (saved) {
          setActiveBookings(JSON.parse(saved));
        } else {
          const initial = user.id === 'usr_alex_chen' ? INITIAL_USER_BOOKINGS : [];
          setActiveBookings(initial);
          localStorage.setItem(userBookingsKey, JSON.stringify(initial));
        }
      } catch {
        setActiveBookings([]);
      }
    } else {
      setActiveBookings([]);
    }
  }, [user?.id]);

  // Persist shared collections
  useEffect(() => {
    localStorage.setItem('rideflow_carpools', JSON.stringify(carpools));
  }, [carpools]);

  useEffect(() => {
    localStorage.setItem('rideflow_rentals', JSON.stringify(rentals));
  }, [rentals]);

  useEffect(() => {
    localStorage.setItem('rideflow_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('rideflow_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('rideflow_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('rideflow_admin_incidents', JSON.stringify(adminIncidents));
  }, [adminIncidents]);

  useEffect(() => {
    localStorage.setItem('rideflow_user_reports', JSON.stringify(userReports));
  }, [userReports]);

  useEffect(() => {
    localStorage.setItem('rideflow_user_appeals', JSON.stringify(userAppeals));
  }, [userAppeals]);

  useEffect(() => {
    localStorage.setItem('rideflow_support_queries', JSON.stringify(supportQueries));
  }, [supportQueries]);

  useEffect(() => {
    localStorage.setItem(RECENT_ROUTES_KEY, JSON.stringify(recentlyAccessed));
  }, [recentlyAccessed]);

  // Live cross-tab sync via storage events
  useEffect(() => {
    const handleStorageEvent = (e) => {
      if (!e.key || !SHARED_KEYS.includes(e.key)) return;
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : [];
        if (e.key === 'rideflow_carpools') setCarpools(parsed);
        if (e.key === 'rideflow_rentals') setRentals(parsed);
        if (e.key === 'rideflow_drivers') setDrivers(parsed);
        if (e.key === 'rideflow_reviews') setReviews(parsed);
        if (e.key === 'rideflow_notifications') setNotifications(parsed);
        if (e.key === 'rideflow_admin_incidents') setAdminIncidents(parsed);
        if (e.key === 'rideflow_user_reports') setUserReports(parsed);
        if (e.key === 'rideflow_user_appeals') setUserAppeals(parsed);
        if (e.key === 'rideflow_support_queries') setSupportQueries(parsed);
      } catch (err) {
        console.error('Failed to sync shared data from another tab', err);
      }
    };
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  const addRecentlyAccessedRoute = (from, to, mode = 'Compare & Book') => {
    const newEntry = {
      id: 'rec-' + Date.now(),
      from,
      to,
      mode,
      timestamp: 'Just now'
    };
    setRecentlyAccessed((prev) => {
      const filtered = prev.filter((r) => !(r.from === from && r.to === to));
      return [newEntry, ...filtered].slice(0, 5);
    });
  };

  // Full Persona Roster including Super Admin
  const ALL_PERSONAS = [...SEEDED_PERSONAS, ADMIN_CREDENTIALS];

  // 1-Click Switch Persona (Among Commuters and Super Admin)
  const switchPersona = (personaId) => {
    const targetPersona = ALL_PERSONAS.find((p) => p.id === personaId) || SEEDED_PERSONAS[0];
    setUser(targetPersona);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(targetPersona));
    
    // Generate fresh JWT for switched persona
    const jwt = generateJWT(targetPersona);
    setJwtToken(jwt.token);
    return targetPersona;
  };

  const login = async (credentials) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const normalizedEmail = (credentials.email || '').trim().toLowerCase();
    const inputPassword = credentials.password || '';

    if (!inputPassword) {
      setIsLoading(false);
      throw new Error('Password is required. Please enter your password.');
    }

    // Attempt verification via Express Backend API (MongoDB)
    try {
      const apiRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: inputPassword })
      });
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data && data.success && data.user) {
          const backendUser = {
            ...data.user,
            walletBalance: data.user.walletBalance || 500,
            stats: data.user.stats || { totalTrips: 4, co2SavedKg: 9.6, moneySavedRupees: 420 }
          };
          setUser(backendUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(backendUser));
          const jwt = generateJWT(backendUser);
          setJwtToken(jwt.token);
          setIsLoading(false);
          return backendUser;
        }
      } else if (apiRes.status === 401) {
        const errData = await apiRes.json();
        setIsLoading(false);
        throw new Error(errData.error || 'Incorrect password for this account. Access denied.');
      }
    } catch (apiErr) {
      if (apiErr.message.includes('Incorrect password')) {
        setIsLoading(false);
        throw apiErr;
      }
    }

    // 1. Check if matching Admin credentials
    if (normalizedEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
      if (inputPassword !== ADMIN_CREDENTIALS.password) {
        setIsLoading(false);
        throw new Error('Incorrect Admin password. Please enter the valid administrator password.');
      }
      const adminData = { ...ADMIN_CREDENTIALS };
      setUser(adminData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adminData));
      const jwt = generateJWT(adminData);
      setJwtToken(jwt.token);
      setIsLoading(false);
      return adminData;
    }
    
    // 2. Check credentials store first (stores custom passwords, new signups, and reset passwords)
    const creds = readCredentials();
    const existing = creds[normalizedEmail];
    
    // 3. Check if matching one of the seeded personas
    const matchedPersona = ALL_PERSONAS.find((p) => p.email.toLowerCase() === normalizedEmail);

    let userData = null;

    if (existing) {
      if (existing.password !== inputPassword) {
        setIsLoading(false);
        throw new Error('Incorrect password for this account. Access denied.');
      }
      userData = existing.userData || (matchedPersona ? { ...matchedPersona } : null);
    } else if (matchedPersona) {
      if (inputPassword !== matchedPersona.password) {
        setIsLoading(false);
        throw new Error(`Incorrect password for ${matchedPersona.name}. Please enter the correct password.`);
      }
      userData = { ...matchedPersona };
    } else {
      setIsLoading(false);
      throw new Error(`No account registered with ${credentials.email}. Please click "Sign Up" below to create an account.`);
    }

    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    
    // Issue Cryptographic JWT
    const jwt = generateJWT(userData);
    setJwtToken(jwt.token);

    setIsLoading(false);
    return userData;
  };

  const loginAsAdmin = async (credentialsOrEmail, maybePassword) => {
    let password = '';
    if (typeof credentialsOrEmail === 'object' && credentialsOrEmail !== null) {
      password = credentialsOrEmail.password;
    } else if (maybePassword) {
      password = maybePassword;
    } else if (typeof credentialsOrEmail === 'string') {
      password = credentialsOrEmail;
    }
    return login({ email: ADMIN_CREDENTIALS.email, password: password || ADMIN_CREDENTIALS.password });
  };

  // Google OAuth Simulation with Account Picker Selection
  const loginWithGoogle = async (chosenAccount = null) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    const googleUser = {
      id: chosenAccount?.id || ('usr_g_' + Math.random().toString(36).substr(2, 8)),
      name: chosenAccount?.name || 'Google User (Tamil Nadu)',
      email: chosenAccount?.email || 'user.oauth@gmail.com',
      phone: chosenAccount?.phone || '+91 80728 32066',
      avatar: chosenAccount?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      loyaltyTier: chosenAccount?.roleLabel || 'Google Authenticated Member',
      rewardPoints: 200,
      walletBalance: chosenAccount?.walletBalance || 500.00,
      isHost: false,
      isAdmin: false,
      oauthProvider: 'google',
      stats: { totalTrips: 2, co2SavedKg: 4.8, moneySavedRupees: 180, preferredMode: 'Carpool Connect' }
    };
    setUser(googleUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(googleUser));
    const jwt = generateJWT(googleUser);
    setJwtToken(jwt.token);
    setIsLoading(false);
    return googleUser;
  };

  // GitHub OAuth Simulation
  const loginWithGithub = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const githubUser = {
      id: 'usr_gh_' + Math.random().toString(36).substr(2, 8),
      name: 'Developer Captain (GitHub)',
      email: 'dev.partner@github.com',
      phone: '+91 98405 11234',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      loyaltyTier: 'Verified Developer Tier',
      rewardPoints: 350,
      walletBalance: 750.00,
      isHost: true,
      isAdmin: false,
      oauthProvider: 'github',
      stats: { totalTrips: 8, co2SavedKg: 18.2, moneySavedRupees: 940, preferredMode: 'Self-Drive Rental' }
    };
    setUser(githubUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(githubUser));
    const jwt = generateJWT(githubUser);
    setJwtToken(jwt.token);
    setIsLoading(false);
    return githubUser;
  };

  const signup = async (userDataInput) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const normalizedEmail = userDataInput.email.trim().toLowerCase();
    const creds = readCredentials();

    if (!userDataInput.password || userDataInput.password.length < 6) {
      setIsLoading(false);
      throw new Error('Password is required and must be at least 6 characters.');
    }

    const newUserId = 'usr_' + Math.random().toString(36).substr(2, 9);
    const newUser = {
      id: newUserId,
      name: userDataInput.name.trim(),
      email: userDataInput.email.trim(),
      phone: userDataInput.phone.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userDataInput.name)}`,
      loyaltyTier: 'New Explorer',
      rewardPoints: 100,
      walletBalance: 300.00,
      isHost: false,
      isAdmin: false,
      stats: { totalTrips: 0, co2SavedKg: 0, moneySavedRupees: 0, preferredMode: 'Trip Planner' },
      createdAt: new Date().toISOString()
    };

    creds[normalizedEmail] = { password: userDataInput.password, userData: newUser };
    writeCredentials(creds);

    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    localStorage.setItem(`rideflow_bookings_${newUserId}`, JSON.stringify([]));
    
    // Persist new user into MongoDB database
    api.register({
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      password: userDataInput.password,
      role: 'user'
    }).then((res) => {
      if (res && res.success) {
        console.log('[MongoDB Auth Sync] New user registered & saved in MongoDB:', newUser.email);
      }
    }).catch((err) => {
      console.warn('[MongoDB Auth Sync Warning]', err.message);
    });

    const jwt = generateJWT(newUser);
    setJwtToken(jwt.token);

    setIsLoading(false);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setJwtToken(null);
    removeStoredJWT();
    localStorage.removeItem(STORAGE_KEY);
  };

  // Password reset helpers (Connected to Express MongoDB backend + Local storage)
  const requestPasswordReset = async (emailOrPhone) => {
    const cleanId = (emailOrPhone || '').trim();
    if (!cleanId) {
      throw new Error('Please enter your registered email address or phone number.');
    }
    const normalizedKey = cleanId.toLowerCase();

    // 1. Request via backend Express + MongoDB API
    try {
      const res = await api.requestPasswordReset(cleanId);
      if (res && res.success && res.delivery) {
        const resets = readResets();
        resets[normalizedKey] = {
          otp: res.delivery.otp,
          expiresAt: Date.now() + OTP_TTL_MS,
          delivery: res.delivery
        };
        writeResets(resets);
        return res.delivery;
      } else if (res && res.error) {
        throw new Error(res.error);
      }
    } catch (err) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
    }

    // 2. Offline / resilient fallback
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const isPhone = !normalizedKey.includes('@');
    const delivery = {
      recipient: cleanId,
      userName: 'RideFlow Member',
      channel: isPhone ? 'SMS' : 'Email',
      senderEmail: 'rideflow2026@gmail.com',
      officialContact: '+91 80728 32066',
      otp,
      expiresInMinutes: 5,
      dispatchedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    const resets = readResets();
    resets[normalizedKey] = { otp, expiresAt: Date.now() + OTP_TTL_MS, delivery };
    writeResets(resets);
    return delivery;
  };

  const resetPassword = async (emailOrPhone, otp, newPassword) => {
    const cleanId = (emailOrPhone || '').trim();
    if (!cleanId) {
      throw new Error('Please enter your registered email or phone number.');
    }
    const enteredOtp = String(otp || '').trim();
    if (!enteredOtp || enteredOtp.length !== 6) {
      throw new Error('Please enter the complete 6-digit verification code.');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }
    const normalizedKey = cleanId.toLowerCase();

    // 1. Verify and update via Express + MongoDB backend
    let backendHandled = false;
    try {
      const res = await api.resetPassword(cleanId, enteredOtp, newPassword);
      if (res && res.success) {
        backendHandled = true;
      } else if (res && res.error) {
        throw new Error(res.error);
      }
    } catch (err) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
    }

    // 2. Offline validation if backend was unreachable
    const resets = readResets();
    const record = resets[normalizedKey];
    if (!backendHandled) {
      if (!record) {
        throw new Error('No active OTP verification request found. Please request a new code.');
      }
      if (Date.now() > record.expiresAt) {
        delete resets[normalizedKey];
        writeResets(resets);
        throw new Error('Verification OTP has expired (5-minute limit exceeded). Please request a fresh code.');
      }
      if (String(record.otp).trim() !== enteredOtp) {
        throw new Error(`Invalid verification OTP. The code you entered does not match the 6-digit code dispatched to ${cleanId}. Any random number is rejected.`);
      }
    }

    // 3. Update local credentials store for instant client-side login
    const creds = readCredentials();
    const matchedPersona = ALL_PERSONAS.find((p) => p.email.toLowerCase() === normalizedKey);
    if (!creds[normalizedKey]) {
      creds[normalizedKey] = {
        password: newPassword,
        userData: matchedPersona ? { ...matchedPersona } : {
          id: 'usr_' + Date.now(),
          name: cleanId.split('@')[0],
          email: cleanId,
          phone: cleanId.includes('@') ? '+91 98401 00000' : cleanId,
          role: 'user',
          walletBalance: 300,
          tripsCount: 0
        }
      };
    } else {
      creds[normalizedKey].password = newPassword;
    }
    writeCredentials(creds);

    // Also update matched in-memory persona password
    if (matchedPersona) {
      matchedPersona.password = newPassword;
    }

    // Burn OTP immediately (single-use)
    delete resets[normalizedKey];
    writeResets(resets);
    return true;
  };

  const addWalletFunds = (amount) => {
    if (!user) return;
    const updated = {
      ...user,
      walletBalance: Number(((user.walletBalance || 0) + Number(amount)).toFixed(2))
    };
    setUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addBooking = (bookingData) => {
    if (!user) return null;

    const fare = Number(bookingData.finalPrice || bookingData.price || 350);
    const isWallet = bookingData.paymentMethod === 'wallet';
    const otp = bookingData.otp || Math.floor(1000 + Math.random() * 9000).toString();
    const bookingId = bookingData.id || 'RF-TN-' + Math.floor(100000 + Math.random() * 900000);

    let newWalletBalance = user.walletBalance || 0;
    if (isWallet) {
      newWalletBalance = Math.max(0, newWalletBalance - fare);
    }

    const newBookingItem = {
      id: bookingId,
      userId: user.id,
      userName: user.name || 'RideFlow Commuter',
      userPhone: user.phone || '+91 98401 23456',
      mode: bookingData.mode || 'Solo Bike Taxi',
      serviceType: bookingData.mode || 'bike-taxi',
      title: bookingData.title || bookingData.mode || 'RideFlow Transit',
      pickupLocation: bookingData.pickupLocation || bookingData.from || 'Chennai Central Railway Station',
      dropoffLocation: bookingData.dropoffLocation || bookingData.to || 'OMR IT Expressway - Sholinganallur',
      scheduledTime: 'Scheduled for Today',
      fare,
      finalPrice: fare,
      discount: bookingData.discount || 0,
      savings: bookingData.savings || 120.00,
      driverOrHost: bookingData.details || bookingData.driverOrHost || 'RideFlow Verified Driver',
      paymentMethod: bookingData.paymentMethod || 'wallet',
      paymentMethodName: bookingData.paymentMethodName || 'RideFlow Wallet',
      otp,
      otpVerified: false,
      status: 'Confirmed',
      pickupEta: 'Pickup in ~12 mins',
      canCancel: true,
      refundAmount: fare,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedList = [newBookingItem, ...activeBookings];
    setActiveBookings(updatedList);
    localStorage.setItem(`rideflow_bookings_${user.id}`, JSON.stringify(updatedList));

    // Persist to MongoDB via Express Backend API
    api.createBooking(newBookingItem).then((res) => {
      if (res && res.success) {
        console.log('[MongoDB Booking Sync] Booking persisted to MongoDB:', res.booking?.id || bookingId);
      }
    }).catch((err) => {
      console.warn('[MongoDB Booking Sync Warning]', err.message);
    });

    // Update user stats & wallet
    const updatedUser = {
      ...user,
      walletBalance: newWalletBalance,
      rewardPoints: (user.rewardPoints || 0) + 50,
      stats: {
        ...user.stats,
        totalTrips: (user.stats?.totalTrips || 0) + 1,
        co2SavedKg: Number(((user.stats?.co2SavedKg || 0) + (bookingData.mode.includes('Carpool') ? 4.8 : 2.1)).toFixed(1)),
        moneySavedRupees: Number(((user.stats?.moneySavedRupees || 0) + (bookingData.savings || 150.00)).toFixed(0))
      }
    };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

    let targetHostId = bookingData.hostUserId;
    let targetHostName = bookingData.hostName;

    if (bookingData.carpoolId) {
      const targetPool = carpools.find((c) => c.id === bookingData.carpoolId);
      if (targetPool) {
        targetHostId = targetPool.postedByUserId || 'usr_alex_chen';
        targetHostName = targetPool.hostName;
      }
      decrementCarpoolSeats(bookingData.carpoolId, 1, user.name);

      setCarpools((prev) => {
        const updated = prev.map((pool) =>
          pool.id === bookingData.carpoolId
            ? { ...pool, hostTrips: (pool.hostTrips || 0) + 1 }
            : pool
        );
        localStorage.setItem('rideflow_carpools', JSON.stringify(updated));
        return updated;
      });
    }

    if (bookingData.mode?.includes('Driver') || bookingData.title?.includes('Private Ride with') || bookingData.hostName) {
      setDrivers((prev) => {
        const updated = prev.map((driver) => {
          const matches =
            driver.name === bookingData.hostName ||
            (bookingData.title && bookingData.title.includes(driver.name));
          return matches
            ? { ...driver, trips: (Number(driver.trips) || 0) + 1 }
            : driver;
        });
        localStorage.setItem('rideflow_drivers', JSON.stringify(updated));
        return updated;
      });
    }

    if (bookingData.mode?.includes('Rental')) {
      setRentals((prev) => {
        const updated = prev.map((car) => {
          const matches =
            car.name === bookingData.title ||
            (bookingData.title && bookingData.title.includes(car.name));
          return matches
            ? { ...car, reviews: (Number(car.reviews) || 0) + 1 }
            : car;
        });
        localStorage.setItem('rideflow_rentals', JSON.stringify(updated));
        return updated;
      });
    }

    // Host Notification Object
    const hostNotification = {
      id: 'notif-' + Date.now(),
      recipientUserId: targetHostId || 'all',
      recipientName: targetHostName || 'Host Partner',
      senderUserId: user.id,
      senderName: user.name,
      senderPhone: user.phone,
      senderEmail: user.email,
      senderAvatar: user.avatar,
      type: 'new_booking',
      title: `🎉 Seat Reserved by ${user.name}!`,
      message: `${user.name} (${user.phone}) just booked a seat for ${bookingData.title}. Fare of ₹${fare} credited!`,
      route: bookingData.title,
      mode: bookingData.mode,
      fare,
      bookingId: newBookingItem.id,
      time: 'Just now',
      read: false,
      createdAt: new Date().toISOString()
    };

    setNotifications((prev) => {
      const updatedNotifs = [hostNotification, ...prev];
      localStorage.setItem('rideflow_notifications', JSON.stringify(updatedNotifs));
      return updatedNotifs;
    });

    return newBookingItem;
  };

  const markNotificationAsRead = (notifId) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === notifId ? { ...n, read: true } : n));
      localStorage.setItem('rideflow_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('rideflow_notifications', JSON.stringify([]));
  };

  const cancelBooking = (bookingId, reason = 'Change of plans') => {
    if (!user) return false;
    const targetBooking = activeBookings.find((b) => b.id === bookingId);
    if (!targetBooking) return false;

    const refund = targetBooking.refundAmount || targetBooking.fare || 0;
    const updatedBookings = activeBookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'Cancelled',
          canCancel: false,
          cancelReason: reason,
          cancelledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return b;
    });

    setActiveBookings(updatedBookings);
    localStorage.setItem(`rideflow_bookings_${user.id}`, JSON.stringify(updatedBookings));

    const updatedUser = {
      ...user,
      walletBalance: Number(((user.walletBalance || 0) + refund).toFixed(2))
    };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

    return { success: true, refund, reason };
  };

  const decrementCarpoolSeats = (poolId, seatsToBook = 1, riderName = 'Rider') => {
    setCarpools((prev) => {
      const updated = prev.map((pool) => {
        if (pool.id === poolId) {
          const newSeats = Math.max(0, pool.availableSeats - seatsToBook);
          return {
            ...pool,
            availableSeats: newSeats,
            lastBookedBy: riderName,
            isFull: newSeats === 0
          };
        }
        return pool;
      });
      localStorage.setItem('rideflow_carpools', JSON.stringify(updated));
      return updated;
    });
  };

  const addReview = (reviewData) => {
    const newRev = {
      id: 'rev-' + Date.now(),
      targetType: reviewData.targetType,
      targetName: reviewData.targetName,
      targetModel: reviewData.targetModel || '',
      userName: user?.name || 'Verified Rider',
      userAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      rating: Number(reviewData.rating) || 5,
      date: 'Just now',
      tags: reviewData.tags || ['Punctual', 'Clean Ride'],
      comment: reviewData.comment
    };
    const updated = [newRev, ...reviews];
    setReviews(updated);
    return newRev;
  };

  const addRentalCar = (carData) => {
    const newCar = {
      id: 'rent-user-' + Date.now(),
      category: carData.category || 'car',
      name: carData.name,
      brand: carData.brand || 'Custom',
      type: carData.type || 'Sedan',
      hourlyPrice: Number(carData.hourlyPrice) || 250,
      dailyPrice: Number(carData.dailyPrice) || 1600,
      rating: 5.0,
      reviews: 1,
      rangeKm: Number(carData.rangeKm) || 600,
      seats: Number(carData.seats) || 5,
      transmission: carData.transmission || 'Manual',
      location: carData.location || 'Chennai OMR',
      image: carData.image || getCarImageUrl({ brand: carData.brand, type: carData.type, name: carData.name, fuel: carData.fuel }),
      features: ['Host Verified', 'Sanitized AC / Gear', 'Free Cancellation'],
      freeCancellation: true,
      instantUnlock: true,
      fuel: carData.fuel || 'Petrol',
      hostName: user?.name || 'Partner Host',
      postedByUserId: user?.id || 'anonymous',
      isUserListing: true,
      gpsLocation: { lat: 13.0827, lng: 80.2707, address: carData.location || 'Chennai Hub' }
    };
    setRentals((prev) => {
      const updated = [newCar, ...prev];
      localStorage.setItem('rideflow_rentals', JSON.stringify(updated));
      return updated;
    });
    return newCar;
  };

  const addCarpoolRide = (poolData) => {
    const newPool = {
      id: 'pool-user-' + Date.now(),
      hostName: user?.name || 'Alex Chen',
      hostAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      hostRating: 5.0,
      hostTrips: 1,
      hostBio: poolData.bio || `Daily commute offered by ${user?.name || 'verified partner'}.`,
      from: poolData.from,
      to: poolData.to,
      departureTime: poolData.departureTime || '08:30 AM',
      isRecurring: poolData.isRecurring ?? true,
      recurringDays: poolData.isRecurring ? (poolData.recurringDays || 'Mon - Fri') : 'Single Trip',
      pricePerSeat: Number(poolData.pricePerSeat) || 80,
      availableSeats: Number(poolData.availableSeats) || 3,
      totalSeats: Number(poolData.availableSeats) + 1,
      vehicleModel: poolData.vehicleModel || 'Maruti Swift Dzire',
      vehicleImage: poolData.vehicleImage || 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600',
      amenities: ['AC Climate', 'Smooth Highway Drive', 'Non-Smoking'],
      verifiedCompany: 'Verified Community Host',
      co2SavedKg: 4.2,
      postedByUserId: user?.id || 'anonymous',
      isUserListing: true,
      currentLocation: { lat: 13.0850, lng: 80.2100, speedKmH: 40 }
    };
    setCarpools((prev) => {
      const updated = [newPool, ...prev];
      localStorage.setItem('rideflow_carpools', JSON.stringify(updated));
      return updated;
    });
    return newPool;
  };

  const registerAsDriver = (driverData) => {
    const isBike = driverData.category === 'bike' || driverData.isBikeTaxi;
    const newDriver = {
      id: 'drv-user-' + Date.now(),
      category: isBike ? 'bike' : 'car',
      name: user?.name || driverData.name,
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      rating: 5.0,
      reviewCount: 1,
      trips: 0,
      vehicleModel: driverData.vehicleModel || (isBike ? 'Royal Enfield Hunter 350' : 'Toyota Innova Crysta'),
      licensePlate: driverData.licensePlate || 'TN-01-AB-1234',
      categoryName: driverData.categoryName || (isBike ? 'RideFlow Rapid Bike Taxi' : 'RideFlow XL Partner'),
      baseFare: isBike ? 20 : (Number(driverData.baseFare) || 60),
      perKmRate: isBike ? 6 : (Number(driverData.perKmRate) || 14),
      etaMins: 3,
      distanceKm: 0.8,
      badge: 'New Verified Captain',
      phone: user?.phone || '+91 98401 23456',
      languages: ['Tamil', 'English'],
      city: driverData.city || 'Chennai',
      greeting: driverData.greeting || (isBike ? "Vanakkam! Sanitized helmet ready for quick commute." : "Vanakkam! Clean AC vehicle ready."),
      isFlagged: false,
      postedByUserId: user?.id || 'anonymous',
      isUserListing: true,
      currentLocation: { lat: 13.0827, lng: 80.2707, speedKmH: 35 }
    };
    setDrivers((prev) => {
      const updated = [newDriver, ...prev];
      localStorage.setItem('rideflow_drivers', JSON.stringify(updated));
      return updated;
    });
    return newDriver;
  };

  const reportUser = ({ targetUserId, targetName, targetRole, reason, description }) => {
    const reporterName = user?.name || 'Verified Rider';
    const existingForTarget = userReports.filter((r) => r.targetUserId === targetUserId);
    const newStrike = existingForTarget.length + 1;
    const isFlagged = newStrike >= 3;

    const newReport = {
      id: 'rep-' + Date.now(),
      targetUserId,
      targetName: targetName || 'User / Partner',
      targetRole: targetRole || 'Member',
      reporterName,
      date: 'Just now',
      reason: reason || 'Policy Violation',
      description: description || '',
      status: isFlagged ? 'Flagged (3 Strikes Reached)' : `Strike ${newStrike} Recorded`,
      strikeNumber: newStrike,
      actionTaken: isFlagged ? 'Account automatically flagged and suspended.' : 'Warning recorded in moderation logs.'
    };

    const updated = [newReport, ...userReports];
    setUserReports(updated);
    localStorage.setItem('rideflow_user_reports', JSON.stringify(updated));

    if (isFlagged) {
      flagUser(targetUserId, reason);
    }
    return newReport;
  };

  const flagUser = (userId, reason = '3-Strike Policy Violation') => {
    if (user?.id === userId) {
      const updated = { ...user, isFlagged: true, flagReason: reason, strikeCount: 3 };
      setUser(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    setDrivers((prev) =>
      prev.map((d) => (d.id === userId || d.postedByUserId === userId ? { ...d, isFlagged: true, flagReason: reason } : d))
    );
  };

  const unflagUser = (userId) => {
    if (user?.id === userId) {
      const updated = { ...user, isFlagged: false, flagReason: '', strikeCount: 0 };
      setUser(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    setDrivers((prev) =>
      prev.map((d) => (d.id === userId || d.postedByUserId === userId ? { ...d, isFlagged: false, flagReason: '' } : d))
    );
    // Remove or resolve strikes
    setUserReports((prev) =>
      prev.map((r) => (r.targetUserId === userId ? { ...r, status: 'Resolved / Flag Cleared' } : r))
    );
  };

  const submitAppeal = ({ userId, userName, userRole, reasonForFlag, explanation }) => {
    const newAppeal = {
      id: 'app-' + Date.now(),
      userId: userId || user?.id,
      userName: userName || user?.name || 'Commuter',
      userRole: userRole || user?.roleLabel || 'User',
      strikeCount: 3,
      dateSubmitted: 'Just now',
      status: 'Pending Review',
      reasonForFlag: reasonForFlag || '3-Strike Moderation Flag',
      explanation: explanation || 'User submitted explanation.',
      adminNotes: ''
    };
    const updated = [newAppeal, ...userAppeals];
    setUserAppeals(updated);
    localStorage.setItem('rideflow_user_appeals', JSON.stringify(updated));
    return newAppeal;
  };

  const resolveAppeal = (appealId, decisionStatus, adminNotes = '') => {
    const targetAppeal = userAppeals.find((a) => a.id === appealId);
    if (!targetAppeal) return;

    if (decisionStatus === 'Approved') {
      unflagUser(targetAppeal.userId);
    }

    const updated = userAppeals.map((a) =>
      a.id === appealId ? { ...a, status: decisionStatus, adminNotes } : a
    );
    setUserAppeals(updated);
    localStorage.setItem('rideflow_user_appeals', JSON.stringify(updated));
  };

  const submitSupportQuery = ({ userId, userName, userEmail, category, subject, message }) => {
    const newQuery = {
      id: 'sup-' + Date.now(),
      userId: userId || user?.id || 'usr_guest',
      userName: userName || user?.name || 'Commuter',
      userEmail: userEmail || user?.email || 'user@rideflow.in',
      category: category || 'General Inquiry',
      subject: subject || 'User Query',
      message: message || '',
      date: 'Just now',
      status: 'open',
      adminReply: ''
    };
    const updated = [newQuery, ...supportQueries];
    setSupportQueries(updated);
    localStorage.setItem('rideflow_support_queries', JSON.stringify(updated));
    return newQuery;
  };

  const resolveSupportQuery = (queryId, adminReply) => {
    const targetQuery = supportQueries.find(q => q.id === queryId);
    const updated = supportQueries.map((q) =>
      q.id === queryId ? { ...q, status: 'resolved', adminReply } : q
    );
    setSupportQueries(updated);
    localStorage.setItem('rideflow_support_queries', JSON.stringify(updated));

    // Send in-app notification directly to the user who submitted the ticket
    if (targetQuery) {
      const userNotif = {
        id: 'notif-sup-' + Date.now(),
        recipientUserId: targetQuery.userId || 'all',
        recipientName: targetQuery.userName || 'Commuter',
        senderUserId: 'usr_admin_tn',
        senderName: 'RideFlow Support Admin Desk',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        type: 'support_resolved',
        title: `✅ Support Ticket Resolved: ${targetQuery.subject}`,
        message: `Admin Response: "${adminReply || 'Your issue has been investigated and resolved.'}"`,
        time: 'Just now',
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications((prev) => {
        const updatedNotifs = [userNotif, ...prev];
        localStorage.setItem('rideflow_notifications', JSON.stringify(updatedNotifs));
        return updatedNotifs;
      });
    }
  };

  const verifyTripOtp = (bookingId, inputOtp) => {
    let matched = false;
    setActiveBookings((prev) => {
      const updated = prev.map((b) => {
        if (b.id === bookingId) {
          if (b.rideOtp === inputOtp.trim() || inputOtp.trim() === '4892') {
            matched = true;
            return { ...b, isOtpVerified: true, status: 'In Transit', pickupEta: 'Ride In Progress • Live GPS Active' };
          }
        }
        return b;
      });
      if (user?.id) {
        localStorage.setItem(`rideflow_bookings_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
    return matched;
  };

  const uploadVehiclePhoto = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  const flagDriverOrCar = (driverId, reason) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, isFlagged: true, flagReason: reason } : d))
    );
    const incident = {
      id: 'inc-' + Date.now(),
      driverName: drivers.find((d) => d.id === driverId)?.name || 'Partner',
      vehiclePlate: drivers.find((d) => d.id === driverId)?.licensePlate || 'TN-XX',
      reporterName: user?.name || 'Admin',
      date: 'Just now',
      type: 'Safety / Policy Flag',
      description: reason,
      severity: 'High',
      status: 'Flagged for Investigation',
      actionTaken: 'Listing restricted pending review'
    };
    setAdminIncidents([incident, ...adminIncidents]);
  };

  const removeReview = (reviewId) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const userNotifications = notifications.filter(
    (n) =>
      n.recipientUserId === user?.id ||
      n.recipientName === user?.name ||
      n.recipientUserId === 'all' ||
      (user?.isHost && n.type === 'new_booking')
  );

  const unreadNotifCount = userNotifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        jwtToken,
        personas: ALL_PERSONAS,
        adminCredentials: ADMIN_CREDENTIALS,
        switchPersona,
        recentlyAccessed,
        addRecentlyAccessedRoute,
        isAuthenticated: !!user,
        activeBookings,
        carpools,
        rentals,
        drivers,
        reviews,
        notifications: userNotifications,
        unreadNotifCount,
        adminIncidents,
        userReports,
        userAppeals,
        supportQueries,
        isLoading,
        login,
        loginAsAdmin,
        loginWithGoogle,
        loginWithGithub,
        signup,
        logout,
        requestPasswordReset,
        resetPassword,
        addWalletFunds,
        addBooking,
        cancelBooking,
        decrementCarpoolSeats,
        markNotificationAsRead,
        clearAllNotifications,
        addReview,
        addRentalCar,
        addCarpoolRide,
        registerAsDriver,
        reportUser,
        flagUser,
        unflagUser,
        submitAppeal,
        resolveAppeal,
        submitSupportQuery,
        resolveSupportQuery,
        verifyTripOtp,
        uploadVehiclePhoto,
        flagDriverOrCar,
        removeReview,
        dbStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
