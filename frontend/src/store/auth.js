import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Reads the `exp` claim (seconds since epoch) out of a JWT without needing a library. */
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false; // no expiry claim — treat as non-expiring
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true; // malformed token — treat as invalid
  }
}

export const useAuth = create(persist((set, get) => ({
  token: null,
  user: null,
  setSession: (token, user) => set({ token, user }),
  logout: () => set({ token: null, user: null }),
  hasRole: (role) => (get().user?.roles || []).includes(role),
  role: () => {
    const roles = get().user?.roles || [];
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('DOCTOR')) return 'DOCTOR';
    if (roles.includes('PATIENT')) return 'PATIENT';
    return null;
  },
  /** Call once on app start: if the persisted session's token has already expired,
   *  clear it immediately instead of showing a stale "logged in" UI until some
   *  API call happens to fail with 401. */
  checkExpiry: () => {
    const { token } = get();
    if (token && isTokenExpired(token)) set({ token: null, user: null });
  }
}), { name: 'healtime-auth' }));