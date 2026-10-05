/**
 * RideFlow Frontend API Client
 * Seamlessly connects React UI to the Express + MongoDB backend at http://localhost:5000/api
 * Includes automatic offline resilience / fallback to localStorage when disconnected.
 */

const API_BASE_URL = typeof window !== 'undefined' && (window.location.port === '3000' || window.location.port === '3001')
  ? 'http://localhost:5000/api'
  : '/api';


const fetchWithTimeout = async (url, options = {}, timeoutMs = 4000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const api = {
  // Check backend & MongoDB connection health
  async checkHealth() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/health`, { method: 'GET' }, 2500);
      if (res.ok) {
        return await res.json();
      }
      return { status: 'offline', database: 'Local Storage Fallback' };
    } catch {
      return { status: 'offline', database: 'Local Storage Fallback' };
    }
  },

  // Auth: Login
  async login(phoneOrEmail, password) {
    try {
      const body = phoneOrEmail.includes('@') 
        ? { email: phoneOrEmail, password } 
        : { phone: phoneOrEmail, password };

      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('[API Auth Fallback] Server unreachable, using local auth verification.');
      return { offline: true };
    }
  },

  // Auth: Register
  async register(userData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      return await res.json();
    } catch {
      return { offline: true };
    }
  },

  // Auth: Request Password Reset OTP
  async requestPasswordReset(identifier) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/request-reset`, {
        method: 'POST',
        body: JSON.stringify({ identifier })
      });
      return await res.json();
    } catch {
      return { offline: true };
    }
  },

  // Auth: Reset Password with Strict OTP Verification
  async resetPassword(identifier, otp, newPassword) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ identifier, otp, newPassword })
      });
      return await res.json();
    } catch {
      return { offline: true };
    }
  },

  // Bookings: Create ride booking
  async createBooking(bookingData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/bookings/create`, {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });
      return await res.json();
    } catch {
      return { offline: true };
    }
  },

  // Bookings: Verify 4-digit Ride Start OTP
  async verifyOTP(bookingId, enteredOtp) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/bookings/${bookingId}/verify-otp`, {
        method: 'POST',
        body: JSON.stringify({ enteredOtp })
      });
      return await res.json();
    } catch {
      return { offline: true };
    }
  },

  // Moderation: Issue strike
  async issueStrike(strikeData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/moderation/strike`, {
        method: 'POST',
        body: JSON.stringify(strikeData)
      });
      return await res.json();
    } catch {
      return { offline: true };
    }
  },

  // Moderation: Submit appeal
  async submitAppeal(appealData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/moderation/appeal`, {
        method: 'POST',
        body: JSON.stringify(appealData)
      });
      return await res.json();
    } catch {
      return { offline: true };
    }
  },

  // Moderation: Resolve appeal (Admin)
  async resolveAppeal(appealId, decision, adminNotes, reviewedBy) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/moderation/appeal/${appealId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ decision, adminNotes, reviewedBy })
      });
      return await res.json();
    } catch {
      return { offline: true };
    }
  },

  // Support: Submit inquiry
  async submitQuery(queryData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/moderation/query`, {
        method: 'POST',
        body: JSON.stringify(queryData)
      });
      return await res.json();
    } catch {
      return { offline: true };
    }
  },

  // Fleet: Fetch vehicles
  async getVehicles() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/fleet/vehicles`, { method: 'GET' });
      return await res.json();
    } catch {
      return { offline: true };
    }
  },

  // Fleet: Register Rental Vehicle
  async registerRental(carData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/fleet/register-rental`, {
        method: 'POST',
        body: JSON.stringify(carData)
      });
      return await res.json();
    } catch {
      return { offline: true };
    }
  },

  // Fleet: Fetch Rental Vehicles
  async getRentals() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/fleet/rentals`, { method: 'GET' });
      return await res.json();
    } catch {
      return { offline: true };
    }
  },

  // Fleet: Offer Carpool Ride
  async offerCarpool(poolData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/fleet/offer-carpool`, {
        method: 'POST',
        body: JSON.stringify(poolData)
      });
      return await res.json();
    } catch {
      return { offline: true };
    }
  },

  // Fleet: Fetch Carpools
  async getCarpools() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/fleet/carpools`, { method: 'GET' });
      return await res.json();
    } catch {
      return { offline: true };
    }
  },

  // Fleet: Register Driver Partner
  async registerDriver(driverData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/fleet/register-driver`, {
        method: 'POST',
        body: JSON.stringify(driverData)
      });
      return await res.json();
    } catch {
      return { offline: true };
    }
  },

  // Fleet: Fetch Driver Partners
  async getDrivers() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/fleet/drivers`, { method: 'GET' });
      return await res.json();
    } catch {
      return { offline: true };
    }
  }
};
