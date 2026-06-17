import type { ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);

  return parts.filter(Boolean).map((part, index) => {
    const bold = /^\*\*([^*]+)\*\*$/.exec(part);
    if (bold) return <strong key={index}>{bold[1]}</strong>;

    const code = /^`([^`]+)`$/.exec(part);
    if (code) {
      return (
        <code key={index} className="rounded bg-foreground/10 px-1 py-0.5 text-[0.92em]">
          {code[1]}
        </code>
      );
    }

    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      return (
        <a key={index} href={link[2]} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-2">
          {link[1]}
        </a>
      );
    }

    return part;
  });
}

type MarkdownMessageProps = {
  content: string;
};

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const nodes: ReactNode[] = [];
  let listItems: string[] = [];
  let listType: "ul" | "ol" | null = null;

  function flushList() {
    if (!listType || listItems.length === 0) return;
    const Tag = listType;
    nodes.push(
      <Tag key={`list-${nodes.length}`} className="my-1 ml-4 list-outside space-y-1">
        {listItems.map((item, index) => (
          <li key={index}>{renderInline(item)}</li>
        ))}
      </Tag>
    );
    listItems = [];
    listType = null;
  }

  for (const line of lines) {
    const ordered = /^\d+[.)]\s+(.+)$/.exec(line);
    const unordered = /^[-*]\s+(.+)$/.exec(line);

    if (ordered) {
      if (listType !== "ol") flushList();
      listType = "ol";
      listItems.push(ordered[1]);
      continue;
    }

    if (unordered) {
      if (listType !== "ul") flushList();
      listType = "ul";
      listItems.push(unordered[1]);
      continue;
    }

    flushList();
    nodes.push(
      <p key={`p-${nodes.length}`} className="my-1 first:mt-0 last:mb-0">
        {renderInline(line)}
      </p>
    );
  }

  flushList();
  return <>{nodes}</>;
}
