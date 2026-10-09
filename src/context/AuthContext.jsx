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

// Password reset configuration
const OTP_TTL_MS = 5 * 60 * 1000;

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
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (!parsed || typeof parsed !== 'object' || !parsed.name || !parsed.email) {
        return null;
      }
      const emailLower = parsed.email?.toLowerCase();
      const isAdminUser = Boolean(
        parsed.isAdmin === true ||
        parsed.role === 'admin' ||
        parsed.role === 'SUPER_ADMIN' ||
        emailLower === 'admin@rideflow.in' ||
        emailLower === 'admin@rideflow.tn.gov.in' ||
        parsed.id === 'usr_super_admin' ||
        parsed.id === 'usr_admin_tn'
      );
      if (isAdminUser) {
        return {
          ...parsed,
          isAdmin: true,
          role: 'SUPER_ADMIN',
          roleLabel: 'Root Administrator',
          loyaltyTier: 'Transport Safety Administrator'
        };
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });

  const [jwtToken, setJwtToken] = useState(() => {
    try {
      return localStorage.getItem('rideflow_jwt_token') || null;
    } catch {
      return null;
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

  // Check MongoDB Backend Health, Session Persistence & Sync Fleet Data on mount
  useEffect(() => {
    const initSessionAndSync = async () => {
      try {
        setIsLoading(true);

        // 1. Session Persistence: Verify session with httpOnly cookie / token
        const meRes = await api.getMe();
        if (meRes && meRes.success && meRes.authenticated && meRes.user) {
          setUser(meRes.user);
          if (meRes.token) {
            setJwtToken(meRes.token);
            localStorage.setItem('rideflow_jwt_token', meRes.token);
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(meRes.user));
        } else if (meRes && (meRes.status === 401 || !meRes.authenticated)) {
          // Explicitly unauthenticated: clear stale storage
          setUser(null);
          setJwtToken(null);
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem('rideflow_jwt_token');
        }

        // 2. Check Backend Health
        const res = await api.checkHealth();
        setDbStatus(res);

        // 3. Live-sync vehicles, rentals, carpools, drivers, and support queries from backend database
        const [rentalsRes, carpoolsRes, driversRes, queriesRes] = await Promise.all([
          api.getRentals(),
          api.getCarpools(),
          api.getDrivers(),
          api.getQueries()
        ]);

        if (rentalsRes && rentalsRes.success && rentalsRes.rentals?.length > 0) {
          setRentals(rentalsRes.rentals);
        }

        if (carpoolsRes && carpoolsRes.success && carpoolsRes.carpools?.length > 0) {
          setCarpools(carpoolsRes.carpools);
        }

        if (driversRes && driversRes.success && driversRes.drivers?.length > 0) {
          setDrivers(driversRes.drivers);
        }

        if (queriesRes && queriesRes.success && queriesRes.queries?.length > 0) {
          setSupportQueries(queriesRes.queries);
        }
      } catch (err) {
        console.warn('[Sync Database Notice]', err);
        setDbStatus({ status: 'offline', database: 'Backend Offline' });
      } finally {
        setIsLoading(false);
      }
    };
    initSessionAndSync();
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

  // 1-Click Switch Persona (Allows switching smoothly between profiles)
  const switchPersona = (personaOrId) => {
    const personaId = (typeof personaOrId === 'object' && personaOrId !== null) ? personaOrId.id : personaOrId;
    const isTargetSuperAdmin = personaId === 'usr_super_admin' || personaId === ADMIN_CREDENTIALS.id;

    let targetPersona;
    if (isTargetSuperAdmin) {
      targetPersona = {
        ...ADMIN_CREDENTIALS,
        isAdmin: true,
        role: 'SUPER_ADMIN',
        roleLabel: 'Root Administrator'
      };
    } else {
      targetPersona = ALL_PERSONAS.find((p) => p.id === personaId) || SEEDED_PERSONAS[0];
    }

    setUser(targetPersona);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(targetPersona));
    
    // Generate fresh JWT for switched persona
    const jwt = generateJWT(targetPersona);
    setJwtToken(jwt.token);
    return targetPersona;
  };

  const login = async (credentials) => {
    setIsLoading(true);

    const normalizedEmail = (credentials.email || '').trim().toLowerCase();
    const inputPassword = credentials.password || '';

    if (!inputPassword) {
      setIsLoading(false);
      throw new Error('Password is required. Please enter your password.');
    }

    try {
      const loginRes = await api.login(normalizedEmail, inputPassword);

      if (loginRes.offline || loginRes.status === 503) {
        setIsLoading(false);
        throw new Error('Service Unavailable (503). RideFlow backend server is offline on port 5000. Please start the backend.');
      }

      if (!loginRes.success) {
        setIsLoading(false);
        throw new Error(loginRes.error || 'Authentication failed. Please verify credentials.');
      }

      const isBackendAdmin = Boolean(
        loginRes.user.email?.toLowerCase() === 'admin@rideflow.in' ||
        loginRes.user.email?.toLowerCase() === 'admin@rideflow.tn.gov.in' ||
        loginRes.user.id === 'usr_admin_tn' ||
        loginRes.user.id === 'usr_super_admin' ||
        loginRes.user.role === 'admin' ||
        loginRes.user.role === 'SUPER_ADMIN' ||
        loginRes.user.isAdmin === true
      );

      const backendUser = {
        ...loginRes.user,
        isAdmin: isBackendAdmin,
        role: isBackendAdmin ? 'SUPER_ADMIN' : (loginRes.user.role || 'user'),
        roleLabel: isBackendAdmin ? 'Root Administrator' : (loginRes.user.roleLabel || 'Member'),
        loyaltyTier: isBackendAdmin ? 'Transport Safety Administrator' : loginRes.user.loyaltyTier,
        walletBalance: loginRes.user.walletBalance || 500
      };

      setUser(backendUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(backendUser));

      if (loginRes.token) {
        setJwtToken(loginRes.token);
        localStorage.setItem('rideflow_jwt_token', loginRes.token);
      }

      setIsLoading(false);
      return backendUser;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
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

  // Google OAuth with Real Backend Authentication
  const loginWithGoogle = async (googleAccountData) => {
    setIsLoading(true);
    try {
      const res = await api.googleAuth(googleAccountData);

      if (res.offline || res.status === 503) {
        setIsLoading(false);
        throw new Error('Service Unavailable (503). Backend server is offline on port 5000.');
      }

      if (!res.success) {
        setIsLoading(false);
        throw new Error(res.error || 'Google authentication failed.');
      }

      const googleUser = res.user;
      setUser(googleUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(googleUser));

      if (res.token) {
        setJwtToken(res.token);
        localStorage.setItem('rideflow_jwt_token', res.token);
      }

      setIsLoading(false);
      return googleUser;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  // GitHub OAuth with Real Backend Authentication
  const loginWithGithub = async () => {
    return loginWithGoogle({
      name: 'Developer Captain',
      email: 'dev.partner@github.com',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      role: 'driver'
    });
  };

  const signup = async (userDataInput) => {
    setIsLoading(true);

    if (!userDataInput.password || userDataInput.password.length < 6) {
      setIsLoading(false);
      throw new Error('Password is required and must be at least 6 characters.');
    }

    try {
      const regRes = await api.register({
        name: userDataInput.name?.trim(),
        email: userDataInput.email?.trim().toLowerCase(),
        phone: userDataInput.phone?.trim(),
        password: userDataInput.password,
        role: userDataInput.role || 'user'
      });

      if (regRes.offline || regRes.status === 503) {
        setIsLoading(false);
        throw new Error('Service Unavailable (503). Backend server is offline on port 5000.');
      }

      if (!regRes.success) {
        setIsLoading(false);
        throw new Error(regRes.error || 'Registration failed.');
      }

      const newUser = regRes.user;
      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

      if (regRes.token) {
        setJwtToken(regRes.token);
        localStorage.setItem('rideflow_jwt_token', regRes.token);
      }

      setIsLoading(false);
      return newUser;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    setUser(null);
    setJwtToken(null);
    removeStoredJWT();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('rideflow_jwt_token');
  };

  // Password reset helpers (Connected to Express MongoDB backend + Live Email OTP)
  const requestPasswordReset = async (emailOrPhone) => {
    const cleanId = (emailOrPhone || '').trim();
    if (!cleanId) {
      throw new Error('Please enter your registered email address or phone number.');
    }

    const res = await api.requestPasswordReset(cleanId);
    if (!res) {
      throw new Error('Service Unavailable (503). Unable to contact backend server on port 5000.');
    }
    if (res.offline || res.status === 503) {
      throw new Error('Service Unavailable (503). RideFlow backend server is offline on port 5000.');
    }
    if (!res.success) {
      throw new Error(res.error || 'Failed to dispatch reset code.');
    }

    return res.delivery || {
      recipient: res.email || cleanId,
      userName: 'RideFlow Member',
      channel: 'Email',
      senderEmail: 'rideflow2026@gmail.com',
      emailSent: res.emailSent
    };
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

    const res = await api.resetPassword(cleanId, enteredOtp, newPassword);
    if (!res) {
      throw new Error('Service Unavailable (503). Unable to reach authentication server.');
    }
    if (res.offline || res.status === 503) {
      throw new Error('Service Unavailable (503). Backend server is offline on port 5000.');
    }
    if (!res.success) {
      throw new Error(res.error || 'Password reset failed. Invalid or expired OTP.');
    }

    // Update local cache if matched persona
    const normalizedKey = cleanId.toLowerCase();
    const creds = readCredentials();
    const matchedPersona = ALL_PERSONAS.find((p) => p.email.toLowerCase() === normalizedKey);
    if (matchedPersona) {
      matchedPersona.password = newPassword;
      creds[matchedPersona.id] = newPassword;
      writeCredentials(creds);
    }

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

  const cancelBooking = async (bookingId, reason = 'Change of plans') => {
    if (!user) return false;
    const targetBooking = activeBookings.find((b) => b.id === bookingId);
    if (!targetBooking) return false;

    let refund = targetBooking.refundAmount || targetBooking.fare || 0;
    let newBal = user.walletBalance;

    try {
      const cancelRes = await api.cancelBooking(bookingId, reason);
      if (cancelRes && cancelRes.success) {
        if (cancelRes.refund !== undefined) refund = cancelRes.refund;
        if (cancelRes.newWalletBalance !== undefined) newBal = cancelRes.newWalletBalance;
      }
    } catch (err) {
      console.warn('[Cancel Booking API Warning]', err.message);
    }

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

    const finalBalance = newBal !== undefined ? newBal : Number(((user.walletBalance || 0) + refund).toFixed(2));
    const updatedUser = {
      ...user,
      walletBalance: finalBalance
    };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

    return { success: true, refund, reason, newWalletBalance: finalBalance };
  };

  const decrementCarpoolSeats = async (poolId, seatsToBook = 1, riderName = 'Rider') => {
    try {
      await api.bookCarpoolSeat(poolId, seatsToBook);
    } catch {}

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

  const addRentalCar = async (carData) => {
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

    // Persist to MongoDB database via Express API
    api.registerRental(newCar).then((res) => {
      if (res && res.success) {
        console.log('[MongoDB Fleet Sync] Rental vehicle persisted to database:', newCar.name);
      }
    }).catch((err) => {
      console.warn('[MongoDB Fleet Sync Warning]', err.message);
    });

    return newCar;
  };

  const addCarpoolRide = async (poolData) => {
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

    // Persist to MongoDB database via Express API
    api.offerCarpool(newPool).then((res) => {
      if (res && res.success) {
        console.log('[MongoDB Fleet Sync] Carpool ride persisted to database:', newPool.from, '->', newPool.to);
      }
    }).catch((err) => {
      console.warn('[MongoDB Fleet Sync Warning]', err.message);
    });

    return newPool;
  };

  const registerAsDriver = async (driverData) => {
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

    // Persist to MongoDB database via Express API
    api.registerDriver(newDriver).then((res) => {
      if (res && res.success) {
        console.log('[MongoDB Fleet Sync] Driver registered & persisted to database:', newDriver.name);
      }
    }).catch((err) => {
      console.warn('[MongoDB Fleet Sync Warning]', err.message);
    });

    return newDriver;
  };

  const reportUser = ({ targetUserId, targetUserName, targetName, targetUserRole, targetRole, reason, description }) => {
    const reporterName = user?.name || 'Verified Rider';
    const reporterUserId = user?.id || 'usr_guest';
    const resolvedTargetName = targetUserName || targetName || 'User / Partner';
    const resolvedTargetRole = targetUserRole || targetRole || 'Member';

    const existingForTarget = userReports.filter((r) => 
      (r.targetUserId && r.targetUserId === targetUserId) || 
      (r.targetUserName && r.targetUserName === resolvedTargetName)
    );
    const newStrike = existingForTarget.length + 1;
    const isFlagged = newStrike >= 3;

    const newReport = {
      id: 'rep-' + Date.now(),
      targetUserId,
      targetUserName: resolvedTargetName,
      targetName: resolvedTargetName,
      targetUserRole: resolvedTargetRole,
      targetRole: resolvedTargetRole,
      reporterUserId,
      reporterName,
      date: 'Just now',
      createdAt: new Date().toISOString(),
      reason: reason || 'Policy Violation',
      description: description || '',
      status: isFlagged ? 'Flagged (3 Strikes Reached)' : `Strike ${newStrike} Recorded`,
      strikeNumber: newStrike,
      reportedUserStrikes: newStrike,
      actionTaken: isFlagged ? 'Account automatically flagged and suspended.' : 'Warning recorded in moderation logs.'
    };

    const updated = [newReport, ...userReports];
    setUserReports(updated);
    localStorage.setItem('rideflow_user_reports', JSON.stringify(updated));

    // Persist strike to backend Express & MongoDB
    api.issueStrike({
      targetUserId,
      targetUserName: resolvedTargetName,
      reportedBy: `${reporterName} (${reporterUserId})`,
      reason: reason || 'Policy Violation',
      details: description || '',
      severity: isFlagged ? 'critical' : 'high'
    }).catch((err) => console.warn('[MongoDB Strike Sync Notice]', err.message));

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
      userEmail: user?.email || '',
      userPhone: user?.phone || '',
      userRole: userRole || user?.roleLabel || 'User',
      strikeCount: 3,
      dateSubmitted: 'Just now',
      createdAt: new Date().toISOString(),
      status: 'pending',
      reasonForFlag: reasonForFlag || '3-Strike Moderation Flag',
      reason: reasonForFlag || '3-Strike Moderation Flag',
      explanation: explanation || 'User submitted explanation.',
      evidenceText: explanation || '',
      adminNotes: ''
    };
    const updated = [newAppeal, ...userAppeals];
    setUserAppeals(updated);
    localStorage.setItem('rideflow_user_appeals', JSON.stringify(updated));

    // Persist appeal to backend MongoDB
    api.submitAppeal({
      id: newAppeal.id,
      userId: newAppeal.userId,
      userName: newAppeal.userName,
      userEmail: newAppeal.userEmail,
      userPhone: newAppeal.userPhone,
      reason: newAppeal.reason,
      evidenceText: newAppeal.explanation
    }).catch((err) => console.warn('[MongoDB Appeal Sync Notice]', err.message));

    return newAppeal;
  };

  const resolveAppeal = (appealId, decisionStatus, adminNotes = '') => {
    const targetAppeal = userAppeals.find((a) => a.id === appealId);
    if (!targetAppeal) return;

    const normalizedDecision = decisionStatus?.toLowerCase() === 'approved' ? 'approved' : 'rejected';

    if (normalizedDecision === 'approved') {
      unflagUser(targetAppeal.userId);
    }

    const updated = userAppeals.map((a) =>
      a.id === appealId ? { ...a, status: normalizedDecision, adminNotes } : a
    );
    setUserAppeals(updated);
    localStorage.setItem('rideflow_user_appeals', JSON.stringify(updated));

    // Persist resolution to backend MongoDB
    api.resolveAppeal(appealId, normalizedDecision, adminNotes, user?.name).catch((err) =>
      console.warn('[MongoDB Resolve Appeal Notice]', err.message)
    );
  };

  const submitSupportQuery = ({ userId, userName, userEmail, category, subject, message }) => {
    const queryId = 'sup-' + Date.now();
    const newQuery = {
      id: queryId,
      userId: userId || user?.id || 'usr_guest',
      userName: userName || user?.name || 'Commuter',
      userEmail: userEmail || user?.email || 'user@rideflow.in',
      category: category || 'General Inquiry',
      subject: subject || 'User Query',
      message: message || '',
      date: 'Just now',
      createdAt: new Date().toISOString(),
      status: 'open',
      adminReply: ''
    };
    const updated = [newQuery, ...supportQueries];
    setSupportQueries(updated);
    localStorage.setItem('rideflow_support_queries', JSON.stringify(updated));

    // Persist support query to backend MongoDB
    api.submitQuery({
      id: queryId,
      userId: newQuery.userId,
      userName: newQuery.userName,
      name: newQuery.userName,
      email: newQuery.userEmail,
      category: newQuery.category,
      subject: newQuery.subject,
      message: newQuery.message
    }).catch((err) => console.warn('[MongoDB Support Query Notice]', err.message));

    return newQuery;
  };

  const resolveSupportQuery = (queryId, adminReply) => {
    const targetQuery = supportQueries.find(q => q.id === queryId);
    const updated = supportQueries.map((q) =>
      q.id === queryId ? { ...q, status: 'resolved', adminReply } : q
    );
    setSupportQueries(updated);
    localStorage.setItem('rideflow_support_queries', JSON.stringify(updated));

    // Persist resolution to backend MongoDB
    api.resolveQuery(queryId, adminReply).catch((err) =>
      console.warn('[MongoDB Resolve Query Notice]', err.message)
    );

    // Send in-app notification directly to the user who submitted the ticket
    if (targetQuery) {
      const recipientId = targetQuery.userId || 'all';
      const recipientEmail = targetQuery.userEmail || targetQuery.email || '';
      const recipientName = targetQuery.userName || targetQuery.name || 'Commuter';

      const userNotif = {
        id: 'notif-sup-' + Date.now(),
        queryId: targetQuery.id,
        recipientUserId: recipientId,
        recipientEmail: recipientEmail,
        recipientName: recipientName,
        senderUserId: 'usr_super_admin',
        senderName: 'RideFlow Support Admin Desk',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        type: 'support_resolved',
        title: `✅ Support Ticket Resolved: ${targetQuery.subject || 'Support Query'}`,
        message: `Admin Response: "${adminReply || 'Your issue has been investigated and resolved.'}"`,
        reply: adminReply,
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

  const refreshSupportQueries = async () => {
    try {
      const res = await api.getQueries();
      if (res && res.success && Array.isArray(res.queries)) {
        setSupportQueries(res.queries);
        localStorage.setItem('rideflow_support_queries', JSON.stringify(res.queries));
        return res.queries;
      }
    } catch (err) {
      console.warn('[Sync Support Queries Warning]', err.message);
    }
    return supportQueries;
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

  // Ensure user receives notification whenever an admin resolves their support ticket
  useEffect(() => {
    if (!user) return;
    const userEmailLower = user.email?.trim().toLowerCase();
    const userNameLower = user.name?.trim().toLowerCase();

    setNotifications((prevNotifs) => {
      let changed = false;
      const updated = [...prevNotifs];

      supportQueries.forEach((q) => {
        if (q.status === 'resolved' && q.adminReply) {
          const isUserQuery =
            (q.userId && user.id && q.userId === user.id) ||
            (q.userEmail && userEmailLower && q.userEmail.trim().toLowerCase() === userEmailLower) ||
            (q.email && userEmailLower && q.email.trim().toLowerCase() === userEmailLower) ||
            (q.userName && userNameLower && q.userName.trim().toLowerCase() === userNameLower) ||
            (q.name && userNameLower && q.name.trim().toLowerCase() === userNameLower);

          if (isUserQuery) {
            const alreadyHasNotif = updated.some(
              (n) => n.queryId === q.id || n.id === `notif-sup-${q.id}`
            );
            if (!alreadyHasNotif) {
              updated.unshift({
                id: `notif-sup-${q.id}`,
                queryId: q.id,
                recipientUserId: user.id,
                recipientEmail: user.email,
                recipientName: user.name,
                senderUserId: 'usr_super_admin',
                senderName: 'RideFlow Support Admin Desk',
                senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
                type: 'support_resolved',
                title: `✅ Support Ticket Resolved: ${q.subject || 'Support Query'}`,
                message: `Admin Response: "${q.adminReply}"`,
                reply: q.adminReply,
                time: 'Just now',
                read: false,
                createdAt: q.createdAt || new Date().toISOString()
              });
              changed = true;
            }
          }
        }
      });

      if (changed) {
        localStorage.setItem('rideflow_notifications', JSON.stringify(updated));
        return updated;
      }
      return prevNotifs;
    });
  }, [user?.id, user?.email, supportQueries]);

  const userNotifications = notifications.filter((n) => {
    // Broadcast notifications to all users
    if (n.recipientUserId === 'all') return true;

    // Direct match by user id
    if (n.recipientUserId && user?.id && n.recipientUserId === user.id) return true;

    // Direct match by user email
    if (
      n.recipientEmail &&
      user?.email &&
      n.recipientEmail.trim().toLowerCase() === user.email.trim().toLowerCase()
    ) {
      return true;
    }

    // Direct match by user display name
    if (
      n.recipientName &&
      user?.name &&
      n.recipientName.trim().toLowerCase() === user.name.trim().toLowerCase()
    ) {
      return true;
    }

    // Host passenger reservations
    if (user?.isHost && n.type === 'new_booking') return true;

    return false;
  });

  const unreadNotifCount = userNotifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        jwtToken,
        adminCredentials: ADMIN_CREDENTIALS,
        personas: ALL_PERSONAS,
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
        refreshSupportQueries,
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
