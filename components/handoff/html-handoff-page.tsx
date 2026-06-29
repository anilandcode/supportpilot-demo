import { readFileSync } from "node:fs";
import path from "node:path";
import Script from "next/script";
import { HandoffRuntime, type HandoffPageKey } from "@/components/handoff/handoff-runtime";

type HtmlHandoffPageProps = {
  fileName: string;
  pageKey: HandoffPageKey;
  data: Record<string, unknown>;
};

export function HtmlHandoffPage({ fileName, pageKey, data }: HtmlHandoffPageProps) {
  const html = readFileSync(path.join(process.cwd(), "Design Upgrade", fileName), "utf8");
  const css = scopeHandoffCss(extractAll(html, /<style[^>]*>([\s\S]*?)<\/style>/g).join("\n\n"), pageKey);
  const scripts = extractAll(html, /<script[^>]*>([\s\S]*?)<\/script>/g);
  const body = rewritePrototypeLinks(extractBody(html).replace(/<script[^>]*>[\s\S]*?<\/script>/g, ""), data.routes as Record<string, string> | undefined);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `${css}\n\n${handoffCompatibilityCss}` }} />
      <div className={`supportpilot-handoff supportpilot-handoff-${pageKey}`} dangerouslySetInnerHTML={{ __html: body }} />
      {scripts.map((script, index) => (
        <Script key={`${fileName}-${index}`} id={`supportpilot-${pageKey}-prototype-${index}`} strategy="afterInteractive">
          {script}
        </Script>
      ))}
      <HandoffRuntime pageKey={pageKey} data={data} />
    </>
  );
}

function extractAll(source: string, pattern: RegExp) {
  return Array.from(source.matchAll(pattern), (match) => match[1]);
}

function extractBody(source: string) {
  const match = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!match) throw new Error("Missing body in SupportPilot handoff HTML.");
  return match[1].trim();
}

function scopeHandoffCss(css: string, pageKey: HandoffPageKey) {
  const scope = `.supportpilot-handoff-${pageKey}`;

  return css.replace(/([^{}]+)\{/g, (match, selector: string) => {
    if (selector.trim().startsWith("@")) return match;

    const scopedSelector = selector
      .replace(/(^|[,\s>+~]):root\b/g, `$1${scope}`)
      .replace(/(^|[,\s>+~])html\b/g, `$1${scope}`)
      .replace(/(^|[,\s>+~])body\b/g, `$1${scope}`)
      .replace(/(^|[,\s>+~])\*(?=[\s:{.#\[]|$)/g, `$1${scope} *`);

    return `${scopedSelector}{`;
  });
}

function rewritePrototypeLinks(html: string, routes: Record<string, string> = {}) {
  const map: Record<string, string> = {
    "dashboard-overview.html": "/admin",
    "dashboard-conversations.html": routes.conversationHref || "/admin/tickets",
    "dashboard-knowledge.html": "/admin/knowledge",
    "dashboard-approvals.html": "/admin/approvals",
    "dashboard-analytics.html": "/admin/analytics",
    "dashboard-settings.html": "/admin/settings",
    "customer-portal.html": "/portal",
    "index.html": "/",
    "mqtcrl86-supportpilot-lynai-stage-14-clean.html": "/",
    "supportpilot-lynai-stage-14-clean.html": "/",
  };

  return html.replace(/href=(["'])([^"']+)\1/g, (full, quote: string, rawHref: string) => {
    const [base, hash] = rawHref.split("#");
    const nextHref = map[base];
    if (!nextHref) return full;
    return `href=${quote}${nextHref}${hash ? `#${hash}` : ""}${quote}`;
  });
}

const handoffCompatibilityCss = `
.supportpilot-handoff {
  min-height: 100vh;
}

.supportpilot-handoff:not(.supportpilot-handoff-portal) {
  background: var(--canvas);
  color: var(--ink);
  display: flex;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  width: 100%;
}

.supportpilot-handoff:not(.supportpilot-handoff-portal) .dashboard-container::before {
  content: none;
  display: none;
}

.supportpilot-handoff-portal::before {
  content: none;
  display: none;
}

.supportpilot-handoff-portal {
  align-items: center;
}

.supportpilot-handoff-portal > header,
.supportpilot-handoff-portal > main,
.supportpilot-handoff-portal > footer {
  width: min(var(--max), calc(100% - (var(--gutter) * 2)));
  margin-inline: auto;
}

.supportpilot-handoff-portal main {
  padding-top: clamp(28px, 4vw, 40px);
}

.supportpilot-handoff-portal .portal-split-container {
  margin-top: 0;
}

@media (max-width: 760px) {
  .supportpilot-handoff:not(.supportpilot-handoff-portal) {
    flex-direction: column;
  }

  .supportpilot-handoff-portal {
    max-width: 100vw;
    overflow-x: hidden;
  }

  .supportpilot-handoff-portal .nav,
  .supportpilot-handoff-portal .nav-actions {
    min-width: 0;
  }

  .supportpilot-handoff-portal .nav {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 12px;
    min-height: auto;
    padding-block: 16px;
  }

  .supportpilot-handoff-portal .nav-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    flex-wrap: wrap;
    gap: 8px;
    justify-content: stretch;
    width: 100%;
  }

  .supportpilot-handoff-portal .nav-actions a,
  .supportpilot-handoff-portal .nav-actions button {
    justify-content: center;
    width: 100%;
  }

  .supportpilot-handoff-portal #btn-open-create-ticket {
    max-width: 100%;
    white-space: normal;
  }

  .supportpilot-handoff-portal main {
    padding-top: 20px;
  }

  .supportpilot-handoff-portal .footer-main {
    grid-template-columns: 1fr;
  }

  .supportpilot-handoff-portal .footer-brand,
  .supportpilot-handoff-portal .footer-col {
    min-width: 0;
    width: 100%;
    min-height: auto;
    padding-inline: 24px;
  }

  .supportpilot-handoff-portal .footer-marquee {
    overflow: hidden;
  }

  .supportpilot-handoff-portal .footer-marquee-track {
    min-width: 0;
    width: max-content;
  }
}
`;
