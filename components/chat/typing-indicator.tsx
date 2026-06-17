"use client";

import { motion } from "framer-motion";
import { BrandAvatar } from "@/components/chat/brand-avatar";
import { theme } from "@/lib/theme";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="flex gap-2.5 w-full justify-start"
      aria-label={`${theme.botName} is typing`}
      role="status"
    >
      <BrandAvatar className="mt-0.5 h-8 w-8" />

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
