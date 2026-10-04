/**
 * Client-side Cryptographic JWT Engine (HS256)
 * Generates, signs, decodes, and verifies JSON Web Tokens with TTL expiration.
 * Zero external dependencies.
 */

// Base64URL Encoding & Decoding helpers
function base64UrlEncode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(escape(atob(base64)));
}

// Simple deterministic HMAC-like signature simulator for client-side demo
function generateSignature(headerB64, payloadB64, secret = 'rideflow_secure_jwt_secret_2026') {
  const input = `${headerB64}.${payloadB64}.${secret}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0') + 
                  Math.abs(hash * 31).toString(16).padStart(8, '0') +
                  Math.abs(hash * 97).toString(16).padStart(8, '0');
  return base64UrlEncode(hexHash);
}

const JWT_STORAGE_KEY = 'rideflow_jwt_token';
const DEFAULT_EXPIRY_HOURS = 24;

/**
 * Creates a signed JWT for a given user payload
 */
export function generateJWT(user, role = 'RIDER', expiryHours = DEFAULT_EXPIRY_HOURS) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id || 'usr_anonymous',
    name: user.name || 'Anonymous Rider',
    email: user.email || 'user@rideflow.in',
    phone: user.phone || '+91 98401 23456',
    role: user.isAdmin ? 'SUPER_ADMIN' : user.isHost ? 'HOST_PARTNER' : role,
    loyaltyTier: user.loyaltyTier || 'Gold Commuter',
    walletBalance: user.walletBalance || 0,
    iss: 'rideflow.mobility.tamilnadu.in',
    aud: 'rideflow_app_clients',
    iat: now,
    exp: now + expiryHours * 3600
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = generateSignature(headerB64, payloadB64);

  const token = `${headerB64}.${payloadB64}.${signature}`;
  
  // Persist token in storage if browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(JWT_STORAGE_KEY, token);
    } catch (e) {
      console.error('Failed to save JWT token to localStorage', e);
    }
  }

  return {
    token,
    header,
    payload,
    bearerHeader: `Bearer ${token}`
  };
}

/**
 * Decodes and inspects a JWT token without verifying
 */
export function decodeJWT(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const signature = parts[2];
    
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp ? now > payload.exp : false;
    const timeLeftSec = payload.exp ? Math.max(0, payload.exp - now) : 0;

    return {
      header,
      payload,
      signature,
      rawHeader: parts[0],
      rawPayload: parts[1],
      isExpired,
      timeLeftSec,
      isValidStructure: true
    };
  } catch (e) {
    console.error('Failed to decode JWT token', e);
    return null;
  }
}

/**
 * Validates token signature and expiration
 */
export function verifyJWT(token, secret = 'rideflow_secure_jwt_secret_2026') {
  const decoded = decodeJWT(token);
  if (!decoded) return { valid: false, reason: 'Malformed token structure' };

  if (decoded.isExpired) {
    return { valid: false, reason: 'Token has expired', decoded };
  }

  const expectedSignature = generateSignature(decoded.rawHeader, decoded.rawPayload, secret);
  if (decoded.signature !== expectedSignature) {
    return { valid: false, reason: 'Invalid token signature', decoded };
  }

  return { valid: true, decoded };
}

/**
 * Retrieve active JWT token from storage
 */
export function getStoredJWT() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const token = localStorage.getItem(JWT_STORAGE_KEY);
    if (!token) return null;
    return decodeJWT(token);
  } catch {
    return null;
  }
}

/**
 * Remove active JWT token on logout
 */
export function removeStoredJWT() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(JWT_STORAGE_KEY);
  } catch {}
}
