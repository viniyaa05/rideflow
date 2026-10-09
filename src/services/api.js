/**
 * RideFlow Frontend API Client
 * Centralized network client routing all HTTP traffic through /api and /api/v1
 * Enforces httpOnly cookie credentials and standard HTTP error handling.
 */

const API_BASE_URL = '/api/v1';

const FALLBACK_API_BASE_URL = typeof window !== 'undefined' && (window.location.port === '3000' || window.location.port === '3001')
  ? 'http://localhost:5000/api/v1'
  : '/api';

/**
 * Standard fetch wrapper with AbortController timeout & credentials: 'include'
 */
const fetchWithTimeout = async (url, options = {}, timeoutMs = 12000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('rideflow_jwt_token') : null;
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Automatically passes and receives httpOnly cookies
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
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

/**
 * Safe JSON parser with standard status checking
 */
const handleResponse = async (res) => {
  try {
    const data = await res.json();
    if (!res.ok) {
      const errorMsg = data?.error || `Request failed with status ${res.status}`;
      return { success: false, status: res.status, error: errorMsg, ...data };
    }
    return data;
  } catch {
    if (!res.ok) {
      return { success: false, status: res.status, error: `Server error (${res.status})` };
    }
    return { success: true };
  }
};

const handleOfflineError = (err) => {
  console.warn('[API Client Notice] Server connection error:', err.message);
  return {
    success: false,
    status: 503,
    error: 'Service Unavailable (503). RideFlow backend server is currently unreachable. Please ensure the Express server is running on port 5000.',
    offline: true
  };
};

export const api = {
  // Check backend & MongoDB connection health
  async checkHealth() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/health`, { method: 'GET' }, 4000);
      return await handleResponse(res);
    } catch {
      try {
        const fallbackRes = await fetchWithTimeout(`${FALLBACK_API_BASE_URL}/health`, { method: 'GET' }, 4000);
        return await handleResponse(fallbackRes);
      } catch (err) {
        return handleOfflineError(err);
      }
    }
  },

  // Auth: Verify active session on app boot (Session Persistence)
  async getMe() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/me`, { method: 'GET' }, 6000);
      return await handleResponse(res);
    } catch {
      try {
        const fallbackRes = await fetchWithTimeout(`${FALLBACK_API_BASE_URL}/auth/me`, { method: 'GET' }, 6000);
        return await handleResponse(fallbackRes);
      } catch (err) {
        return handleOfflineError(err);
      }
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
      return await handleResponse(res);
    } catch {
      try {
        const body = phoneOrEmail.includes('@') ? { email: phoneOrEmail, password } : { phone: phoneOrEmail, password };
        const fallbackRes = await fetchWithTimeout(`${FALLBACK_API_BASE_URL}/auth/login`, {
          method: 'POST',
          body: JSON.stringify(body)
        });
        return await handleResponse(fallbackRes);
      } catch (err) {
        return handleOfflineError(err);
      }
    }
  },

  // Auth: Register
  async register(userData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(userData)
      }, 15000);
      return await handleResponse(res);
    } catch {
      try {
        const fallbackRes = await fetchWithTimeout(`${FALLBACK_API_BASE_URL}/auth/register`, {
          method: 'POST',
          body: JSON.stringify(userData)
        }, 15000);
        return await handleResponse(fallbackRes);
      } catch (err) {
        return handleOfflineError(err);
      }
    }
  },

  // Auth: Logout (clears server cookie)
  async logout() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/logout`, { method: 'POST' }, 5000);
      return await handleResponse(res);
    } catch {
      try {
        const fallbackRes = await fetchWithTimeout(`${FALLBACK_API_BASE_URL}/auth/logout`, { method: 'POST' }, 5000);
        return await handleResponse(fallbackRes);
      } catch {
        return { success: true };
      }
    }
  },

  // Auth: Google OAuth Sign-in & Session Creation
  async googleAuth(googleData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        body: JSON.stringify(googleData)
      }, 15000);
      return await handleResponse(res);
    } catch {
      try {
        const fallbackRes = await fetchWithTimeout(`${FALLBACK_API_BASE_URL}/auth/google`, {
          method: 'POST',
          body: JSON.stringify(googleData)
        }, 15000);
        return await handleResponse(fallbackRes);
      } catch (err) {
        return handleOfflineError(err);
      }
    }
  },

  // Auth: Sync OAuth user (legacy compatibility)
  async syncOAuthUser(userData) {
    return this.googleAuth(userData);
  },

  // Auth: Request Password Reset OTP
  async requestPasswordReset(identifier) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/request-reset`, {
        method: 'POST',
        body: JSON.stringify({ identifier })
      }, 15000);
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Auth: Reset Password with OTP
  async resetPassword(identifier, otp, newPassword) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ identifier, otp, newPassword })
      }, 15000);
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Bookings: Create ride booking
  async createBooking(bookingData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/bookings/create`, {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Bookings: Verify 4-digit Ride Start OTP
  async verifyOTP(bookingId, enteredOtp) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/bookings/${bookingId}/verify-otp`, {
        method: 'POST',
        body: JSON.stringify({ enteredOtp })
      });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Bookings: Cancel booking with 100% instant refund
  async cancelBooking(bookingId, reason = 'Change of plans') {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Bookings: Fetch passenger bookings
  async getUserBookings(userId) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/bookings/user/${userId}`, { method: 'GET' });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Fleet: Fetch vehicles
  async getVehicles(category) {
    try {
      const query = category ? `?category=${encodeURIComponent(category)}` : '';
      const res = await fetchWithTimeout(`${API_BASE_URL}/fleet/vehicles${query}`, { method: 'GET' });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Fleet: Fetch Rental Vehicles
  async getRentals() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/fleet/rentals`, { method: 'GET' });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Fleet: Register Rental Vehicle
  async registerRental(carData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/fleet/register-rental`, {
        method: 'POST',
        body: JSON.stringify(carData)
      });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Fleet: Fetch Carpools
  async getCarpools() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/fleet/carpools`, { method: 'GET' });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Fleet: Offer Carpool Ride
  async offerCarpool(poolData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/fleet/offer-carpool`, {
        method: 'POST',
        body: JSON.stringify(poolData)
      });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Fleet: Atomic seat booking
  async bookCarpoolSeat(poolId, seatsCount = 1) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/fleet/carpools/${poolId}/book-seat`, {
        method: 'POST',
        body: JSON.stringify({ seatsCount })
      });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Fleet: Fetch Driver Partners
  async getDrivers() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/fleet/drivers`, { method: 'GET' });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Fleet: Register Driver Partner
  async registerDriver(driverData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/fleet/register-driver`, {
        method: 'POST',
        body: JSON.stringify(driverData)
      });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Routes: Dynamic Fare Calculation
  async getFares(distanceKm, surgeMultiplier) {
    try {
      const query = `?distanceKm=${distanceKm || 12.5}${surgeMultiplier ? `&surgeMultiplier=${surgeMultiplier}` : ''}`;
      const res = await fetchWithTimeout(`${API_BASE_URL}/route/fares${query}`, { method: 'GET' });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Routes: Distance Calculation
  async getDistance(from, to) {
    try {
      const query = `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
      const res = await fetchWithTimeout(`${API_BASE_URL}/route/distance${query}`, { method: 'GET' });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Moderation: Issue strike
  async issueStrike(strikeData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/moderation/strike`, {
        method: 'POST',
        body: JSON.stringify(strikeData)
      });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Moderation: Submit appeal
  async submitAppeal(appealData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/moderation/appeal`, {
        method: 'POST',
        body: JSON.stringify(appealData)
      });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Moderation: Resolve appeal (Admin)
  async resolveAppeal(appealId, decision, adminNotes, reviewedBy) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/moderation/appeal/${appealId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ decision, adminNotes, reviewedBy })
      });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Support: Submit inquiry
  async submitQuery(queryData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/moderation/query`, {
        method: 'POST',
        body: JSON.stringify(queryData)
      });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Support: Fetch all queries
  async getQueries() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/moderation/queries`, { method: 'GET' });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  },

  // Support: Resolve inquiry with Admin response
  async resolveQuery(queryId, adminReply, reviewedBy = 'Admin Desk') {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/moderation/query/${queryId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ adminReply, reviewedBy })
      });
      return await handleResponse(res);
    } catch (err) {
      return handleOfflineError(err);
    }
  }
};

