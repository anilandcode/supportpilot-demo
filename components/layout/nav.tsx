"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { theme } from "@/lib/theme";

const LINKS = [
  { label: "Demo",         href: "#demo"    },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing",      href: "#economics" },
  { label: "Dashboard",    href: "/admin"   },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-30 border-b border-border backdrop-blur-md"
      style={{
        background: "color-mix(in srgb, var(--background) 80%, transparent)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between relative">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-accent" aria-hidden />
          <span className="text-[15px] font-semibold text-foreground">{theme.productName}</span>
        </a>

        {/* Center links (desktop) */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[14px] text-foreground-2 hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right: Book a call (desktop) */}
        <div className="hidden md:flex items-center shrink-0">
          <a
            href={theme.escalation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent text-white text-[14px] font-medium px-4 py-2 rounded-full hover:bg-accent-hover transition-colors"
          >
            {theme.escalation.label}
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex md:hidden p-2 rounded-lg text-foreground-2 hover:text-foreground transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-card px-6 py-5 flex flex-col gap-1">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-[14px] text-foreground-2 hover:text-foreground py-3 border-b border-border last:border-0 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href={theme.escalation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 py-3 text-center bg-accent text-white text-[14px] font-medium rounded-full hover:bg-accent-hover transition-colors"
          >
            {theme.escalation.label}
          </a>
        </div>
      )}
    </header>
  );
}
