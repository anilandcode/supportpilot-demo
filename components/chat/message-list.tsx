"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { isTextUIPart } from "ai";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "./message";
import { TypingIndicator } from "./typing-indicator";
import type { ChatMetadata, Citation } from "@/lib/types";
import type { UIMessage } from "ai";

type MessageListProps = {
  messages: UIMessage<ChatMetadata>[];
  isLoading: boolean;
};

function getTextContent(msg: UIMessage): string {
  return msg.parts.filter(isTextUIPart).map((p) => p.text).join("");
}

function getCitations(msg: UIMessage<ChatMetadata>): Citation[] {
  if (msg.metadata?.citations?.length) return msg.metadata.citations;

  return msg.parts
    .filter((part) => part.type === "source-document" || part.type === "source-url")
    .map((part) => {
      if (part.type === "source-url") {
        return { source: part.title || part.url, url: part.url };
      }

      return { source: part.title || part.filename || part.sourceId };
    });
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const lastIsUser =
    messages.length > 0 && messages[messages.length - 1].role === "user";

  return (
    <ScrollArea className="flex-1 px-4" role="log" aria-live="polite" aria-label="Conversation">
      <div className="flex flex-col gap-4 py-4">
        <AnimatePresence initial={false}>
          {messages
            .filter((m) => m.role !== "system")
            .map((m) => (
              <Message
                key={m.id}
                id={m.id}
                role={m.role as "user" | "assistant"}
                content={getTextContent(m)}
                citations={getCitations(m)}
              />
            ))}

          {isLoading && lastIsUser && <TypingIndicator key="typing" />}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
