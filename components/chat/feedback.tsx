"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

type FeedbackProps = {
  messageId: string;
};

export function Feedback({ messageId }: FeedbackProps) {
  const [value, setValue] = useState<"up" | "down" | null>(null);

  async function send(next: "up" | "down") {
    setValue(next);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, value: next }),
    }).catch(() => {
      setValue(null);
    });
  }

  return (
    <div className="flex items-center gap-1 px-1" aria-label="Answer feedback">
      <button
        type="button"
        onClick={() => send("up")}
        aria-label="Mark answer helpful"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-foreground-3 hover:bg-accent-soft hover:text-accent",
          value === "up" && "bg-accent-soft text-accent"
        )}
      >
        <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => send("down")}
        aria-label="Mark answer unhelpful"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-foreground-3 hover:bg-accent-soft hover:text-accent",
          value === "down" && "bg-accent-soft text-accent"
        )}
      >
        <ThumbsDown className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}
