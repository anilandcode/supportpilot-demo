"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { theme } from "@/lib/theme";

const LINKS = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "/admin/knowledge" },
  { label: "Login", href: "/login" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/50 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6">
        <a href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-fg shadow-sm">
            SP
          </span>
          <span className="text-[15px] font-semibold text-foreground">{theme.productName}</span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[14px] text-foreground-2 transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <a
            href="#demo"
            className="inline-flex h-10 items-center rounded-full border border-border bg-white/80 px-4 text-sm font-medium text-foreground-2 transition-colors hover:border-accent hover:text-accent"
          >
            Try widget
          </a>
          <a
            href={theme.escalation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center rounded-full bg-accent px-4 text-sm font-semibold text-accent-fg shadow-sm transition-colors hover:bg-accent-hover"
          >
            Book demo
          </a>
        </div>

        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex rounded-lg p-2 text-foreground-2 transition-colors hover:text-foreground lg:hidden"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-card px-6 py-5 lg:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-border py-3 text-[14px] text-foreground-2 transition-colors last:border-0 hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            <a
              href="#demo"
              onClick={() => setOpen(false)}
              className="py-3 text-center text-[14px] font-medium text-accent"
            >
              Try widget
            </a>
            <a
              href={theme.escalation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-accent py-3 text-center text-[14px] font-semibold text-accent-fg transition-colors hover:bg-accent-hover"
            >
              Book demo
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
