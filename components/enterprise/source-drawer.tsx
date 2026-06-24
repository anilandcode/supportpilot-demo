import { FileText } from "lucide-react";
import type { AIRun } from "@/lib/enterprise/types";

type SourceDrawerProps = {
  sources: AIRun["sources"];
};

export function SourceDrawer({ sources }: SourceDrawerProps) {
  return (
    <details className="rounded-lg border border-border bg-surface p-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
        <span className="inline-flex items-center gap-2">
          <FileText className="h-4 w-4 text-accent" aria-hidden />
          Approved sources
        </span>
        <span className="text-xs text-foreground-3">{sources.length} cited</span>
      </summary>
      <div className="mt-3 space-y-2">
        {sources.length === 0 ? (
          <p className="text-sm text-foreground-3">No approved source was retrieved. Route this to missing knowledge.</p>
        ) : (
          sources.map((source, index) => (
            <div key={`${source.source}-${source.chunkId ?? source.docId}`} className="rounded-md border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{source.source}</p>
                  <p className="mt-1 text-xs text-foreground-3">
                    Citation {index + 1} · Owner Support Ops · Fresh source
                  </p>
                </div>
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">
                  {Math.round((source.score ?? 0) * 100)}%
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-foreground-2">
                Source ID {source.docId ?? "workspace-doc"} · Chunk {source.chunkId ?? "n/a"} · Indexed today.
              </p>
            </div>
          ))
        )}
      </div>
    </details>
  );
}
