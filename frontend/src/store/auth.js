import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  }
}), { name: 'healtime-auth' }));
