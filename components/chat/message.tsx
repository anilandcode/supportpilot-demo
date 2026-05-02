"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
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
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
};

export function Message({ role, content, citations: citationsProp }: MessageProps) {
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
      {/* Avatar — assistant only */}
      {!isUser && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-fg text-xs font-bold mt-0.5"
          aria-hidden
        >
          P
        </div>
      )}

      <div
        className={cn(
          "flex flex-col gap-1.5 max-w-[80%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-[13px] sm:text-sm leading-relaxed break-words shadow-sm",
            isUser
              ? "bg-accent text-accent-fg rounded-br-sm"
              : "bg-panel border border-border text-foreground rounded-bl-sm"
          )}
        >
          {text}
        </div>

        {citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1">
            {citations.map((c, i) => (
              <Badge key={i} variant="default">
                {c.source}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
