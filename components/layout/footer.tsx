import { ArrowUpRight } from "lucide-react";
import { theme } from "@/lib/theme";

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      ["Overview", "#product"],
      ["Support flow", "#support-flow"],
      ["Integrations", "#integrations"],
      ["Analytics", "#analytics"],
      ["Pricing", "#pricing"],
      ["Admin console", "/admin"],
    ],
  },
  {
    title: "Workspace",
    links: [
      ["Tickets", "/admin/tickets"],
      ["Knowledge", "/admin/knowledge"],
      ["Approvals", "/admin/approvals"],
      ["Settings", "/admin/settings"],
      ["Portal", "/portal"],
      ["Embed", "/embed"],
    ],
  },
  {
    title: "Trust",
    links: [
      ["Security", "#security"],
      ["Sources", "#support-flow"],
      ["Audit logs", "/admin/approvals"],
      ["Model routing", "/admin/analytics"],
      ["Docs", "#docs"],
      ["Status", "/api/stats"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Solutions", "#solutions"],
      ["Use cases", "#solutions"],
      ["FAQ", "#docs"],
      ["Book demo", theme.escalation.url],
      ["Login", "/login"],
      ["Widget test", "/widget-test"],
    ],
  },
] as const;

const marqueeItems = ["Cited answers", "Human approval", "Verified domains", "Audit-ready workflow", "Knowledge gaps", "Model route logs"];

export function Footer() {
  return (
    <footer className="marketing-footer">
      <div className="marketing-footer-main">
        <div className="marketing-footer-brand">
          <a href="/" aria-label={`${theme.productName} home`}>
            <span>SP</span>
            <b>{theme.productName}</b>
          </a>
          <p>
            Warm, branded AI support for customers. Dense, evidence-first oversight for the operators who approve it.
          </p>
          <a href={theme.escalation.url} target="_blank" rel="noopener noreferrer">
            Book a demo <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        </div>

        <div className="marketing-footer-grid">
          {FOOTER_COLUMNS.map((column) => (
            <div className="marketing-footer-col" key={column.title}>
              <h2>{column.title}</h2>
              <ul>
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="marketing-footer-marquee" aria-hidden>
        <div>
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <div className="marketing-footer-bottom">
        <span>© 2026 {theme.productName}. White-label AI support.</span>
        <span>No autonomous refunds, account changes, or external writes without approval.</span>
      </div>
    </footer>
  );
}
