"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyButtonProps = {
  text: string;
  className?: string;
};

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available — silently fail
    }
  }

  return (
    <button
      onClick={copy}
      aria-label={copied ? "Copied!" : "Copy to clipboard"}
      className={[
        "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors",
        copied
          ? "text-green-400 bg-green-950/40"
          : "text-foreground-2 hover:text-foreground hover:bg-[color-mix(in_srgb,var(--color-foreground)_8%,transparent)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5" aria-hidden />
      ) : (
        <Copy className="w-3.5 h-3.5" aria-hidden />
      )}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
