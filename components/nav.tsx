"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { theme } from "@/lib/theme";

const LINKS = [
  { label: "Demo", href: "#chat" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "Dashboard", href: "/admin" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-[color-mix(in_srgb,var(--color-background)_92%,transparent)] backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-accent-fg text-sm font-bold">
            {theme.botName[0]}
          </div>
          <span className="text-base font-bold text-foreground tracking-tight">{theme.productName}</span>
        </a>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-7">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-foreground-2 hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={theme.escalation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-5 rounded-full bg-accent text-accent-fg text-sm font-semibold flex items-center hover:opacity-90 transition-opacity"
          >
            {theme.escalation.label}
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex md:hidden p-2 rounded-lg text-foreground-2 hover:text-foreground hover:bg-[color-mix(in_srgb,var(--color-foreground)_6%,transparent)] transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-card px-5 py-5 flex flex-col gap-1">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-foreground-2 hover:text-foreground py-2.5 border-b border-border last:border-0 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href={theme.escalation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 h-11 rounded-full bg-accent text-accent-fg text-sm font-semibold flex items-center justify-center"
          >
            {theme.escalation.label}
          </a>
        </div>
      )}
    </header>
  );
}
