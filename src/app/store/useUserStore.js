import { create } from "zustand";

const useUserStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  setProfileImage: (image) =>
    set((state) => ({
      user: state.user ? { ...state.user, image } : { image },
    })),
  clearUser: () => set({ user: null }),
}));

export default useUserStore;
