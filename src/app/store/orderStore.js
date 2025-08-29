import { create } from "zustand";

export const useOrderStore = create((set) => ({
  billing: null,
  shipping: null,

  setOrder: (billing, shipping) => set({ billing, shipping }),
  clearOrder: () => set({ billing: null, shipping: null }),
}));
