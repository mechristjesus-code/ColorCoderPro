// Standalone terminal layout — PWA-ready, no navbar, full viewport
// Installable on iPhone/Android home screen via /manifest.json

import type { Metadata, Viewport } from "next";
import { SwRegistrar } from "./SwRegistrar";

export const metadata: Metadata = {
  title: "144K Color Terminal",
  description: "Remote admin terminal — 144,000 Color Project",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ColorTerm",
    startupImage: "/icon-512.png",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192" },
      { url: "/icon-512.png", sizes: "512x512" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#040408",
};

export default function TerminalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SwRegistrar />
      <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
        {children}
      </div>
    </>
  );
}
