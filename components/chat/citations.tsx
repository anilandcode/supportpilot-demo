import { FileText } from "lucide-react";
import type { Citation } from "@/lib/types";

type CitationsProps = {
  citations: Citation[];
};

export function Citations({ citations }: CitationsProps) {
  if (citations.length === 0) return null;

  return (
    <details className="w-full rounded-2xl border border-border bg-card px-3 py-2 text-left">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold text-foreground-2">
        <span className="inline-flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-accent" aria-hidden />
          {citations.length} approved source{citations.length === 1 ? "" : "s"}
        </span>
        <span className="text-foreground-3">Open</span>
      </summary>
      <div className="mt-3 space-y-2">
        {citations.map((citation, index) => (
          <div key={`${citation.source}-${citation.score ?? index}`} className="rounded-xl border border-border bg-surface p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-foreground">{citation.source}</p>
                <p className="mt-1 text-[11px] leading-4 text-foreground-3">
                  Citation {index + 1} • owner Support Ops • fresh source
                </p>
              </div>
              {citation.score != null && (
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
                  {Math.round(citation.score * 100)}%
                </span>
              )}
            </div>
            {citation.sentence && <p className="mt-2 text-xs leading-5 text-foreground-2">{citation.sentence}</p>}
            {citation.url && (
              <a href={citation.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-semibold text-accent">
                View source
              </a>
            )}
          </div>
        ))}
      </div>
    </details>
  );
}
