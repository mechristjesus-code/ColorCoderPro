"use client";

import { useEffect } from "react";

// Registers /sw.js as a service worker for PWA offline support.
// Runs once on mount — silently no-ops if SW is unsupported.
export function SwRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/terminal" })
      .then((reg) => {
        console.log("[SW] registered, scope:", reg.scope);
      })
      .catch((err) => {
        console.warn("[SW] registration failed:", err);
      });
  }, []);

  return null;
}
