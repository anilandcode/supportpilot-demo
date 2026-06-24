import { theme } from "@/lib/theme";

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      ["Overview", "/admin"],
      ["Widget", "/embed"],
      ["Approvals", "/admin/approvals"],
      ["Knowledge", "/admin/knowledge"],
      ["Analytics", "/admin/analytics"],
      ["Integrations", "#integrations"],
    ],
  },
  {
    title: "Solutions",
    links: [
      ["SaaS support", "#use-cases"],
      ["Agencies", "#pricing"],
      ["Enterprise support", "#security"],
      ["Internal support", "#product"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Docs", "/admin/knowledge"],
      ["Security", "#security"],
      ["Changelog", "/admin/analytics"],
      ["Blog", "#faq"],
      ["Status", "/api/stats"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "#product"],
      ["Contact", theme.escalation.url],
      ["Privacy", "#security"],
      ["Terms", "#faq"],
      ["DPA", "#security"],
      ["Subprocessors", "#integrations"],
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="dark-proof px-6 py-14 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <a href="/" className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-[var(--brand-primary-dark)]">
                SP
              </span>
              <span className="text-base font-semibold">{theme.productName}</span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/68">
              White-label AI support with cited answers, confidence scoring, human approval, and audit-ready workflows.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/8 px-3 py-1.5 text-xs font-medium text-white/78">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--semantic-confidence-high)]" aria-hidden />
              Demo workspace online
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h2 className="text-sm font-semibold text-white">{column.title}</h2>
                <ul className="mt-4 space-y-3">
                  {column.links.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className="text-sm text-white/62 transition-colors hover:text-white">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/12 pt-6 text-xs text-white/52 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 {theme.productName}. White-label AI support with cited answers and human approval.</span>
          <span>Built for launch pilots, Pro support teams, and enterprise readiness.</span>
        </div>
      </div>
    </footer>
  );
}
