"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import { AlertCircle, RotateCcw, ShieldCheck, X } from "lucide-react";
import { BrandAvatar } from "@/components/chat/brand-avatar";
import { Composer } from "@/components/chat/composer";
import { EscalationButton } from "@/components/chat/escalation-button";
import { MessageList } from "@/components/chat/message-list";
import { WelcomeCard } from "@/components/chat/welcome-card";
import { theme } from "@/lib/theme";
import type { ChatMetadata } from "@/lib/types";

const CLIENT_MESSAGE_LIMIT = 8;
const transport = new DefaultChatTransport<UIMessage<ChatMetadata>>({ api: "/api/chat" });

type ChatWindowProps = {
  onClose?: () => void;
};

function getTextContent(msg: UIMessage): string {
  return msg.parts.filter(isTextUIPart).map((p) => p.text).join("");
}

export function ChatWindow({ onClose }: ChatWindowProps = {}) {
  const { messages, status, sendMessage, clearError, error } = useChat<UIMessage<ChatMetadata>>({
    transport,
  });

  const [inputValue, setInputValue] = useState("");
  const [clientRateLimited, setClientRateLimited] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "streaming" || status === "submitted";
  const visibleMessages = messages.filter((message) => message.role !== "system");
  const userMessageCount = messages.filter((message) => message.role === "user").length;
  const showEscalation = Boolean(error) || userMessageCount >= 3 || visibleMessages.some((message) => message.metadata?.escalated);
  const configuredTier = theme.tier as "lite" | "enterprise";
  const lastMetadata = useMemo(() => {
    return [...visibleMessages].reverse().find((message) => message.role === "assistant")?.metadata;
  }, [visibleMessages]);
  const isRateLimited = clientRateLimited || Boolean(lastMetadata?.rateLimited);

  useEffect(() => {
    if (status === "ready") shellRef.current?.focus();
  }, [status]);

  function submit(textOverride?: string) {
    const text = (textOverride ?? inputValue).trim();
    if (!text || isLoading) return;

    if (userMessageCount >= CLIENT_MESSAGE_LIMIT) {
      setClientRateLimited(true);
      return;
    }

    setInputValue("");
    setClientRateLimited(false);
    sendMessage({ text });
  }

  function retry() {
    const lastUserMsg = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUserMsg) return;
    clearError();
    sendMessage({ text: getTextContent(lastUserMsg) });
  }

  return (
    <div ref={shellRef} tabIndex={-1} className="flex h-full w-full flex-col overflow-hidden bg-background">
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-3">
        <BrandAvatar className="h-9 w-9" />
        <div className="flex flex-1 flex-col">
          <span className="text-sm font-semibold leading-tight text-foreground">{theme.botName}</span>
          <span className="flex items-center gap-1.5 text-xs text-foreground-2">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden />
            {configuredTier === "enterprise" ? "Enterprise RAG" : "Lite docs mode"}
          </span>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-2 hover:bg-surface hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      {(error || isRateLimited) && (
        <div
          role="alert"
          className="mx-4 mt-3 flex shrink-0 items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div className="flex-1">
            <p className="font-medium">{isRateLimited ? "Demo limit reached." : "Something went wrong."}</p>
            <p className="mt-0.5 text-xs opacity-80">
              {isRateLimited ? "Pause for a moment before sending more questions." : "Retry the last question or escalate to a human."}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {error && (
              <button
                type="button"
                onClick={retry}
                className="flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline"
                aria-label="Retry last message"
              >
                <RotateCcw className="h-3 w-3" aria-hidden />
                Retry
              </button>
            )}
            <EscalationButton inline />
          </div>
        </div>
      )}

      {visibleMessages.length === 0 && !isLoading ? (
        <WelcomeCard onSelect={(question) => submit(question)} />
      ) : (
        <MessageList messages={messages} isLoading={isLoading} />
      )}

      {showEscalation && !error && !isRateLimited && <EscalationButton />}

      <Composer
        value={inputValue}
        onChange={setInputValue}
        onSubmit={() => submit()}
        disabled={isLoading || isRateLimited}
      />
    </div>
  );
}
