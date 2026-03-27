// ─── Firebase Cloud Functions Callable Wrapper ────────────────────────────────
// This replaces the old axios-based api.js.
// Import and use these helpers instead of direct fetch/axios calls.

import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '@/lib/firebase';

// ─── Generic helper: call a callable function ─────────────────────────────────
export async function callFunction(name, data = {}) {
  const fn = httpsCallable(functions, name);
  const result = await fn(data);
  return result.data;
}

// ─── Generic helper: call an HTTPS (non-callable) function with auth token ───
export async function callHttpFunction(url, body = {}) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// ─── Order Functions ──────────────────────────────────────────────────────────
export const createOrder         = (data) => callFunction('createOrder', data);

// These use the HTTPS-triggered functions (for Razorpay which needs external calls)
const FUNCTIONS_BASE = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
export const createRazorpayOrder = (data) => callHttpFunction(`${FUNCTIONS_BASE}/createRazorpayOrder`, data);
export const verifyPayment       = (data) => callHttpFunction(`${FUNCTIONS_BASE}/verifyRazorpayPayment`, data);

// ─── Admin Functions ──────────────────────────────────────────────────────────
export const adminGetUsers    = (data) => callFunction('adminGetUsers', data);
export const adminUpdateUser  = (data) => callFunction('adminUpdateUser', data);
export const setAdminClaim    = (data) => callFunction('setAdminClaim', data);

// ─── Contact ──────────────────────────────────────────────────────────────────
export const submitContact    = (data) => callFunction('submitContact', data);
