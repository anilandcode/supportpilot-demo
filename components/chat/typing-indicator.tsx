"use client";

import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="flex gap-2.5 w-full justify-start"
      aria-label="Pilot is typing"
      role="status"
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-fg text-xs font-bold mt-0.5"
        aria-hidden
      >
        P
      </div>

      <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-1.5 h-1.5 rounded-full bg-foreground-2 animate-bounce"
              style={{ animationDelay: `${delay}ms`, animationDuration: "900ms" }}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
