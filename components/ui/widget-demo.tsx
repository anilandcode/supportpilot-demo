"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatWindow } from "@/components/chat/chat-window";

export function WidgetBubble() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open chat preview"
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-accent flex items-center justify-center hover:bg-accent-hover transition-colors"
        style={{ boxShadow: "0 8px 32px color-mix(in srgb, var(--accent) 40%, transparent)" }}
      >
        <MessageCircle className="w-6 h-6 text-white" aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="widget"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[380px] border border-border rounded-[20px] overflow-hidden shadow-2xl"
            style={{
              background: "var(--card)",
              height: "580px",
              transformOrigin: "bottom right",
            }}
          >
            <ChatWindow onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
