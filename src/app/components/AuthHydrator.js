// app/components/AuthHydrator.js
"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/app/store/authStore";

export default function AuthHydrator() {
  const setLoggedIn = useAuthStore((state) => state.setLoggedIn);
  const setLoggedOut = useAuthStore((state) => state.setLoggedOut);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (data.isLoggedIn) {
          setLoggedIn();
        } else {
          setLoggedOut();
        }
      } catch (err) {
        setLoggedOut();
      }
    };

    checkAuth();
  }, [setLoggedIn, setLoggedOut]);

  return null;
}
