"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { theme } from "@/lib/theme";

const LINKS = [
  { label: "Product", href: "#product" },
  { label: "Integrations", href: "#integrations" },
  { label: "Support flow", href: "#support-flow" },
  { label: "Security", href: "#security" },
  { label: "Analytics", href: "#analytics" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
] as const;

const PRODUCT_LINKS = [
  { label: "Admin", href: "/admin" },
  { label: "Portal", href: "/portal" },
  { label: "Embed", href: "/embed" },
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="marketing-nav">
      <div className="marketing-promo">
        <span>SupportPilot demo workspace</span>
        <a href="/admin">Open the enterprise console</a>
      </div>

      <div className="marketing-nav-inner">
        <a href="/" className="marketing-brand" aria-label={`${theme.productName} home`}>
          <span className="marketing-brand-mark">SP</span>
          <span>{theme.productName}</span>
        </a>

        <nav className="marketing-nav-links" aria-label="Marketing">
          {LINKS.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="marketing-nav-actions">
          <a href="/login">Login</a>
          <a className="marketing-button marketing-button-outline" href="/admin">
            Admin
          </a>
          <a className="marketing-button marketing-button-primary" href={theme.escalation.url} target="_blank" rel="noopener noreferrer">
            Book demo <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        </div>

        <button
          type="button"
          className="marketing-menu-button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-controls="marketing-mobile-menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      <div id="marketing-mobile-menu" className="marketing-mobile-menu" aria-hidden={!open} hidden={!open}>
        <nav aria-label="Mobile marketing">
          {[...LINKS, ...PRODUCT_LINKS].map((link) => (
            <a key={link.label} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
        <div>
          <a className="marketing-button marketing-button-outline" href="#demo" onClick={() => setOpen(false)}>
            Try widget
          </a>
          <a
            className="marketing-button marketing-button-primary"
            href={theme.escalation.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            Book demo <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </header>
  );
}
