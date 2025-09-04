import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set) => ({
      cartItems: [],
      totalQuantity: 0,

      setCart: (cart) =>
        set({
          cartItems: cart?.items,
          totalQuantity: cart?.items?.length ||0,
        }),

      clearCart: () =>
        set({
          cartItems: [],
          totalQuantity: 0,
        }),
    }),
    {
      name: "cart-storage", // key in localStorage
    }
  )
);
