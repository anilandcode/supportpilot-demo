import { Badge } from "@/components/ui/badge";
import type { Citation } from "@/lib/types";

type CitationsProps = {
  citations: Citation[];
};

export function Citations({ citations }: CitationsProps) {
  if (citations.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-1">
      {citations.map((citation) => (
        <Badge key={`${citation.source}-${citation.score ?? ""}`} variant="default" title={citation.source}>
          {citation.url ? (
            <a href={citation.url} target="_blank" rel="noreferrer">
              {citation.source}
            </a>
          ) : (
            citation.source
          )}
        </Badge>
      ))}
    </div>
  );
}
