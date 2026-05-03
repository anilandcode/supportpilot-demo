"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart } from "ai";
import { SendHorizonal, AlertCircle, RotateCcw, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageList } from "./message-list";
import { SuggestedQuestions } from "./suggested-questions";
import { EscalationButton } from "./escalation-button";

const MAX_CHARS = 500;
const WARN_CHARS = 400;
const transport = new DefaultChatTransport({ api: "/api/chat" });

type ChatWindowProps = {
  /** When provided, renders a close (X) button in the header — used by ChatWidget */
  onClose?: () => void;
};

export function ChatWindow({ onClose }: ChatWindowProps = {}) {
  const { messages, status, sendMessage, clearError, error } = useChat({ transport });

  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isLoading = status === "streaming" || status === "submitted";
  const visibleMessages = messages.filter((m) => m.role !== "system");
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const showEscalation = !!error || userMessageCount >= 3;
  const charsLeft = MAX_CHARS - inputValue.length;
  const showCounter = inputValue.length > WARN_CHARS;

  // Focus input when assistant finishes responding
  useEffect(() => {
    if (status === "ready") {
      inputRef.current?.focus();
    }
  }, [status]);

  function submit() {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue("");
    sendMessage({ text });
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function onSelectSuggestion(q: string) {
    sendMessage({ text: q });
    inputRef.current?.focus();
  }

  function retry() {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;
    const text = lastUserMsg.parts.filter(isTextUIPart).map((p) => p.text).join("");
    clearError();
    sendMessage({ text });
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        <div
          className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-fg text-xs font-bold"
          aria-hidden
        >
          P
        </div>
        <div className="flex flex-col flex-1">
          <span className="text-sm font-semibold text-foreground leading-tight">Pilot</span>
          <span className="flex items-center gap-1.5 text-xs text-foreground-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" aria-hidden />
            Online
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close chat"
            className="w-8 h-8 flex items-center justify-center rounded-full text-foreground-2 hover:text-foreground hover:bg-[color-mix(in_srgb,var(--color-foreground)_8%,transparent)] transition-colors"
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="mx-4 mt-3 flex items-start gap-3 rounded-lg border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-400 shrink-0"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
          <div className="flex-1">
            <p className="font-medium">Something went wrong.</p>
            <p className="mt-0.5 text-xs opacity-80">Want to talk to a human instead?</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={retry}
              className="flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline"
              aria-label="Retry last message"
            >
              <RotateCcw className="w-3 h-3" aria-hidden />
              Retry
            </button>
            <EscalationButton inline />
          </div>
        </div>
      )}

      {/* Empty state */}
      {visibleMessages.length === 0 && !isLoading && (
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="text-sm sm:text-base text-foreground-2 leading-relaxed max-w-xs">
            Hi, I&apos;m Pilot 👋
            <br />
            Ask me anything about Linear-clone.
          </p>
        </div>
      )}

      {/* Message list */}
      {(visibleMessages.length > 0 || isLoading) && (
        <MessageList messages={messages} isLoading={isLoading} />
      )}

      {/* Escalation strip — after 3 messages or on error (not shown when inline error banner is visible) */}
      {showEscalation && !error && <EscalationButton />}

      {/* Suggested questions — only before first message */}
      {userMessageCount === 0 && !isLoading && (
        <SuggestedQuestions onSelect={onSelectSuggestion} />
      )}

      {/* Input area */}
      <div className="px-4 py-3 border-t border-border bg-card shrink-0">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={onKeyDown}
              placeholder="Ask a question…"
              disabled={isLoading}
              maxLength={MAX_CHARS}
              aria-label="Message input"
              className="bg-surface h-11"
            />
            {showCounter && (
              <span
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums pointer-events-none ${
                  charsLeft <= 20 ? "text-red-500" : "text-foreground-2"
                }`}
                aria-live="polite"
                aria-atomic="true"
              >
                {charsLeft}
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={isLoading || !inputValue.trim()}
            onClick={submit}
            aria-label="Send message"
            className="shrink-0 w-11 h-11 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-40"
          >
            <SendHorizonal className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
