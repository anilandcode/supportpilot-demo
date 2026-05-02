"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { ChatWindow } from "./chat-window";

const SESSION_KEY = "supportpilot:widget:open";

export function ChatWidget() {
  // Initialise from sessionStorage to persist open/closed across soft navigations
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setIsOpen(sessionStorage.getItem(SESSION_KEY) === "true");
    } catch {
      // sessionStorage blocked (e.g. sandboxed iframe) — default to closed
    }
  }, []);

  function toggle() {
    setIsOpen((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem(SESSION_KEY, String(next));
      } catch {}
      return next;
    });
  }

  function close() {
    setIsOpen(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "false");
    } catch {}
  }

  // Don't render until client hydration is complete (prevents flash)
  if (!mounted) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
      style={{ bottom: 24, right: 24 }}
    >
      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "bottom right" }}
            // Mobile: full-screen. Desktop: 400×600 above button.
            className={[
              "bg-panel rounded-2xl shadow-xl border border-border overflow-hidden",
              // full-screen on mobile
              "fixed inset-0 sm:relative sm:inset-auto",
              "sm:w-[400px] sm:h-[600px]",
            ].join(" ")}
          >
            <ChatWindow onClose={close} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble button */}
      <motion.button
        onClick={toggle}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={[
          "w-14 h-14 rounded-full bg-accent text-accent-fg shadow-lg",
          "flex items-center justify-center",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          // Hide bubble on mobile when panel is open (panel is full-screen)
          isOpen ? "hidden sm:flex" : "flex",
        ].join(" ")}
      >
        <MessageCircle className="w-6 h-6" aria-hidden />
      </motion.button>
    </div>
  );
}
