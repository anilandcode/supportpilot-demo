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
  const css = extractAll(html, /<style[^>]*>([\s\S]*?)<\/style>/g).join("\n\n");
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

@media (max-width: 760px) {
  .supportpilot-handoff-portal {
    max-width: 100vw;
    overflow-x: hidden;
  }

  .supportpilot-handoff-portal .nav,
  .supportpilot-handoff-portal .nav-actions {
    min-width: 0;
  }

  .supportpilot-handoff-portal .nav-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .supportpilot-handoff-portal #btn-open-create-ticket {
    max-width: 100%;
    white-space: normal;
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
