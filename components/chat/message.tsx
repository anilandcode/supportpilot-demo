"use client";

import { motion } from "framer-motion";
import { BrandAvatar } from "@/components/chat/brand-avatar";
import { Citations } from "@/components/chat/citations";
import { Feedback } from "@/components/chat/feedback";
import { MarkdownMessage } from "@/components/chat/markdown-message";
import { cn } from "@/lib/utils";
import type { Citation } from "@/lib/types";

const SOURCE_RE = /\[Source:\s*([^\]]+)\]/g;

function parseCitations(content: string): { text: string; citations: Citation[] } {
  const citations: Citation[] = [];
  const text = content
    .replace(SOURCE_RE, (match, source) => {
      citations.push({ source: source.trim(), sentence: match });
      return "";
    })
    .trim();
  return { text, citations };
}

type MessageProps = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
};

export function Message({ id, role, content, citations: citationsProp }: MessageProps) {
  const { text, citations: parsed } = parseCitations(content);
  const citations = citationsProp ?? parsed;
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("flex gap-2.5 w-full", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && <BrandAvatar className="mt-0.5 h-8 w-8" />}

      <div
        className={cn(
          "flex flex-col gap-1.5 max-w-[75%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-[13px] sm:text-sm leading-relaxed break-words",
            isUser
              ? "bg-[var(--color-bubble-user)] text-foreground"
              : "bg-card-elevated border border-border text-foreground"
          )}
        >
          <MarkdownMessage content={text} />
        </div>

        <Citations citations={citations} />
        {!isUser && <Feedback messageId={id} />}
      </div>
    </motion.div>
  );
}
