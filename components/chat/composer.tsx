"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Paperclip, SendHorizonal, X } from "lucide-react";

const MAX_CHARS = 1200;
const MAX_ATTACHMENT_CHARS = 5000;

type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export function Composer({ value, onChange, onSubmit, disabled }: ComposerProps) {
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const charsLeft = MAX_CHARS - value.length;

  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  }

  async function attach(file: File | undefined) {
    setAttachmentError(null);
    if (!file) return;

    if (!/\.(md|txt)$/i.test(file.name) && !file.type.startsWith("text/")) {
      setAttachmentError("Use a text or Markdown file for Lite upload.");
      return;
    }

    const text = (await file.text()).slice(0, MAX_ATTACHMENT_CHARS);
    setAttachmentName(file.name);
    onChange(
      `${value.trim()}\n\nAttached document: ${file.name}\n\n${text}\n\nPlease summarize or explain the attached document.`.trim()
    );
  }

  function clearAttachment() {
    setAttachmentName(null);
    setAttachmentError(null);
    onChange(value.replace(/\n\nAttached document:[\s\S]+$/, "").trim());
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="border-t border-border bg-card p-3">
      {(attachmentName || attachmentError) && (
        <div className="mb-2 flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-xs">
          <span className={attachmentError ? "text-red-600" : "text-foreground-2"}>
            {attachmentError || attachmentName}
          </span>
          <button type="button" onClick={clearAttachment} aria-label="Clear attachment" className="text-foreground-3 hover:text-foreground">
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 focus-within:border-accent">
        <input
          ref={fileRef}
          type="file"
          accept=".md,.txt,text/*"
          className="hidden"
          onChange={(event) => attach(event.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          aria-label="Attach document"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground-3 hover:bg-card hover:text-foreground disabled:opacity-40"
        >
          <Paperclip className="h-4 w-4" aria-hidden />
        </button>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value.slice(0, MAX_CHARS))}
          onKeyDown={keyDown}
          placeholder="Ask a question..."
          disabled={disabled}
          rows={1}
          className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-5 text-foreground placeholder:text-foreground-3 focus:outline-none disabled:opacity-50"
        />
        {charsLeft <= 160 && (
          <span className={charsLeft <= 30 ? "pb-2 text-xs tabular-nums text-red-600" : "pb-2 text-xs tabular-nums text-foreground-3"}>
            {charsLeft}
          </span>
        )}
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg hover:bg-accent-hover disabled:opacity-40"
        >
          <SendHorizonal className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
