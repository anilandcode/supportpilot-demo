"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { isTextUIPart, type UIMessage } from "ai";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "./message";
import { TypingIndicator } from "./typing-indicator";

type MessageListProps = {
  messages: UIMessage[];
  isLoading: boolean;
};

function getTextContent(msg: UIMessage): string {
  return msg.parts.filter(isTextUIPart).map((p) => p.text).join("");
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
                role={m.role as "user" | "assistant"}
                content={getTextContent(m)}
              />
            ))}

          {isLoading && lastIsUser && <TypingIndicator key="typing" />}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
