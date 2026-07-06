"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explorer" },
  { href: "/survey", label: "Discover" },
  { href: "/profile", label: "My Profile" },
  { href: "/about", label: "About" },
];

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 backdrop-blur-md"
      style={{ backgroundColor: "rgba(5,5,8,0.85)" }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image src="/logo-64.png" alt="144,000 Color Project" width={32} height={32} className="rounded-full" />
          <span className="font-semibold text-sm tracking-wide text-white/90 group-hover:text-white transition-colors hidden sm:block">
            Color Project
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                style={{
                  color: active ? "#C9A84C" : "rgba(240,237,232,0.7)",
                  backgroundColor: active ? "rgba(201,168,76,0.1)" : "transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <Link
          href="/explore"
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 hover:brightness-110"
          style={{ background: "linear-gradient(135deg, #C9A84C, #E8C96A)", color: "#050508" }}
        >
          Explore Colors
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-white/70 hover:text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/8 px-6 py-4 flex flex-col gap-2"
          style={{ backgroundColor: "rgba(5,5,8,0.95)" }}>
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-md text-sm font-medium"
                style={{
                  color: active ? "#C9A84C" : "rgba(240,237,232,0.8)",
                  backgroundColor: active ? "rgba(201,168,76,0.1)" : "transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
