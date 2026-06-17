"use client";

import { Sparkles } from "lucide-react";
import { BrandAvatar } from "@/components/chat/brand-avatar";
import { theme } from "@/lib/theme";

type WelcomeCardProps = {
  onSelect: (question: string) => void;
};

export function WelcomeCard({ onSelect }: WelcomeCardProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-5">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <BrandAvatar className="h-10 w-10" />
          <div>
            <p className="text-sm font-semibold text-foreground">{theme.botName}</p>
            <p className="flex items-center gap-1.5 text-xs text-foreground-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
              Online
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-foreground-2">{theme.welcome}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {theme.suggestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => onSelect(question)}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-left text-[13px] text-foreground-2 hover:border-accent hover:text-accent"
            >
              <Sparkles className="mr-1.5 inline h-3 w-3" aria-hidden />
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
