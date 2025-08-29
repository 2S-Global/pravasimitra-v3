import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  isLoggedIn: false,
  setLoggedIn: () => set({ isLoggedIn: true }),
  setLoggedOut: () => set({ isLoggedIn: false }),
}));
