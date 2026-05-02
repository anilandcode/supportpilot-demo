import { Nav } from "@/components/nav";
import { CopyButton } from "@/components/ui/copy-button";
import { ChatWindow } from "@/components/chat/chat-window";
import { ExternalLink, FileText, Pencil } from "lucide-react";

const EMBED_SNIPPET = `<iframe
  src="https://supportpilot-demo.vercel.app/embed"
  width="500px" height="700px"
  frameborder="0" allowtransparency="true"
  style="position:fixed;bottom:0;right:0;border:none;z-index:9999"
></iframe>`;

// ─── Static hero preview (server component — no interactivity needed) ─────────

function HeroChatPreview() {
  return (
    <div className="w-full rounded-2xl border border-border bg-panel shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-accent-fg text-sm font-bold">
            P
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-panel" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Pilot</p>
          <p className="text-xs text-foreground-2">Linear-clone Support · Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="px-5 py-5 flex flex-col gap-4 bg-background">
        {/* Bot */}
        <div className="flex gap-3 items-end">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-accent-fg text-xs font-bold shrink-0 mb-0.5">
            P
          </div>
          <div className="bg-panel border border-border text-foreground text-sm rounded-2xl rounded-bl-sm px-4 py-3 leading-relaxed max-w-[82%]">
            Hey! I&apos;m Pilot 👋 Ask me anything about pricing, features, or integrations.
          </div>
        </div>

        {/* User */}
        <div className="flex justify-end">
          <div className="bg-accent text-accent-fg text-sm rounded-2xl rounded-br-sm px-4 py-3 max-w-[78%] leading-relaxed">
            How much does Pro cost?
          </div>
        </div>

        {/* Bot reply */}
        <div className="flex gap-3 items-end">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-accent-fg text-xs font-bold shrink-0 mb-0.5">
            P
          </div>
          <div className="bg-panel border border-border text-foreground text-sm rounded-2xl rounded-bl-sm px-4 py-3 leading-relaxed max-w-[82%]">
            Pro is <strong>$12 / user / month</strong> — or $9.60 with annual billing.
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 text-xs bg-accent-soft text-accent font-medium rounded-full px-2.5 py-1 border border-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]">
                📄 Pricing Plans
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fake input */}
      <div className="px-5 py-4 border-t border-border bg-panel">
        <div className="flex items-center gap-3 bg-background border border-border rounded-full px-4 py-2.5">
          <span className="text-sm text-foreground-2 flex-1 select-none">Ask a question…</span>
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0" aria-hidden>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Nav />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-5 sm:px-8 pt-16 sm:pt-24 pb-16">
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-20 -z-10"
          style={{ background: "radial-gradient(ellipse at center top, var(--color-accent), transparent 70%)" }}
          aria-hidden
        />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-accent-soft text-accent border border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden />
              AI-powered · 24/7 · Trained on your docs
            </span>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight text-foreground leading-[1.08] mb-6">
              Stop answering<br />the same<br />
              <span className="text-accent">questions.</span>
            </h1>

            <p className="text-lg text-foreground-2 leading-relaxed mb-8 max-w-md">
              SupportPilot is a 24/7 AI support agent trained on your docs. It answers instantly, cites sources, and escalates to humans when it matters.
            </p>

            {/* FIX 4 — "Book a call" uses foreground/30 border so it's clearly visible */}
            <div className="flex flex-wrap gap-3 mb-10">
              <a
                href="#chat"
                className="h-12 px-7 rounded-full bg-accent text-accent-fg font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[color-mix(in_srgb,var(--color-accent)_25%,transparent)]"
              >
                Try the demo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              <a
                href="https://calendly.com/anilpervaiz/15min"
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 px-7 rounded-full border-2 border-[color-mix(in_srgb,var(--color-foreground)_25%,transparent)] text-foreground font-semibold text-sm flex items-center hover:border-[color-mix(in_srgb,var(--color-foreground)_40%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-foreground)_5%,transparent)] transition-colors"
              >
                Book a call
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {(["#C96442", "#2563EB", "#16A34A", "#7C3AED"] as const).map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-panel flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: c }}
                    aria-hidden
                  >
                    {["A", "M", "S", "R"][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-foreground-2">
                <span className="font-semibold text-foreground">12 businesses</span> launched this month
              </p>
            </div>
          </div>

          {/* Right */}
          <div>
            <HeroChatPreview />
          </div>
        </div>
      </section>

      {/* ── Stats — dark inverted bar ── */}
      <section className="bg-[#1C1917]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 grid grid-cols-3 divide-x divide-white/8">
          {[
            { value: "70%",  label: "Questions deflected", sub: "vs. human agents" },
            { value: "$2K+", label: "Saved per month",     sub: "vs. a support VA"  },
            { value: "< 3s", label: "Response time",       sub: "around the clock"  },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center py-10 sm:py-14 px-4 text-center">
              <span className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-1">{s.value}</span>
              <span className="text-xs sm:text-sm text-white/70 font-medium">{s.label}</span>
              <span className="text-xs text-white/40 mt-0.5">{s.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="px-5 sm:px-8 py-24 flex flex-col items-center">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-accent mb-3">How it works</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-4">Live in three steps</h2>
        <p className="text-foreground-2 text-center max-w-md mb-16 leading-relaxed text-sm">
          No engineers required. Go from zero to a live support bot in under 24 hours.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {/* FIX 3 — replaced <> code-brackets with FileText, Pencil, ExternalLink */}
          {[
            {
              n: "01",
              Icon: FileText,
              title: "Upload your docs",
              desc: "Paste your FAQ, drop in Markdown files, or connect a Notion page. The bot learns from whatever you have.",
            },
            {
              n: "02",
              Icon: Pencil,
              title: "Customise voice & brand",
              desc: "Set the bot's name, personality, and colors. Wire an escalation path to Calendly, email, or Slack.",
            },
            {
              n: "03",
              Icon: ExternalLink,
              title: "Embed on your site",
              desc: "Copy one iframe snippet or share a hosted link. Works on Webflow, WordPress, Squarespace — any platform.",
            },
          ].map(({ n, Icon, title, desc }) => (
            <div
              key={n}
              className="bg-panel border border-border rounded-2xl p-7 flex flex-col gap-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-accent-soft text-accent flex items-center justify-center border border-[color-mix(in_srgb,var(--color-accent)_15%,transparent)]">
                  <Icon className="w-5 h-5" aria-hidden />
                </div>
                <span className="text-5xl font-black text-[color-mix(in_srgb,var(--color-foreground)_7%,transparent)] select-none leading-none">
                  {n}
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-foreground-2 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live demo ── */}
      <section id="chat" className="px-5 sm:px-8 py-20 bg-[color-mix(in_srgb,var(--color-accent)_4%,var(--color-background))] border-y border-border">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-accent mb-3">Live demo</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 text-center">Try Pilot right now</h2>
          <p className="text-foreground-2 text-sm mb-10 text-center max-w-md leading-relaxed">
            Real AI, real answers — trained on Linear-clone&apos;s docs. Ask anything about pricing, features, or integrations.
          </p>

          {/* FIX 2 — removed duplicate suggestion chips; ChatWindow shows its own internally */}
          <div className="w-full rounded-2xl border border-border shadow-xl overflow-hidden h-[580px]">
            <ChatWindow />
          </div>
        </div>
      </section>

      {/* ── Widget preview ── */}
      <section className="px-5 sm:px-8 py-24 flex flex-col items-center">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-accent mb-3">Embeddable widget</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-center">Floats on any page</h2>
        <p className="text-foreground-2 text-sm mb-12 text-center max-w-md leading-relaxed">
          A bubble sits in the corner of your site. One tap opens the full chat — zero friction for visitors.
        </p>

        <div className="w-full max-w-2xl rounded-2xl border border-border overflow-hidden shadow-sm">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 mx-3 h-6 rounded-md bg-[color-mix(in_srgb,var(--color-foreground)_6%,transparent)] flex items-center px-3 gap-2">
              <div className="w-3 h-3 rounded-full bg-[color-mix(in_srgb,var(--color-foreground)_10%,transparent)]" />
              <span className="text-[11px] text-foreground-2 font-mono">yoursite.com/pricing</span>
            </div>
          </div>

          {/* Fake page content */}
          <div className="relative h-56 px-8 py-7 bg-background">
            <div className="flex flex-col gap-3 max-w-xs">
              <div className="h-4 w-40 rounded-full bg-[color-mix(in_srgb,var(--color-foreground)_12%,transparent)]" />
              <div className="h-3 w-64 rounded-full bg-[color-mix(in_srgb,var(--color-foreground)_7%,transparent)]" />
              <div className="h-3 w-52 rounded-full bg-[color-mix(in_srgb,var(--color-foreground)_7%,transparent)]" />
              <div className="h-3 w-56 rounded-full bg-[color-mix(in_srgb,var(--color-foreground)_7%,transparent)]" />
              <div className="mt-2 h-8 w-28 rounded-lg bg-[color-mix(in_srgb,var(--color-foreground)_10%,transparent)]" />
            </div>

            {/* FIX 7 — tooltip repositioned, no clipping tail */}
            <div className="absolute bottom-20 right-5 bg-foreground text-background text-xs font-medium rounded-lg px-3 py-2 shadow-lg whitespace-nowrap pointer-events-none">
              Click to preview ↗
            </div>

            {/* Widget bubble */}
            <a
              href="/embed"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open widget preview"
              className="absolute bottom-5 right-5 w-14 h-14 rounded-full bg-accent text-accent-fg shadow-xl shadow-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] flex items-center justify-center hover:scale-105 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── Embed code ── */}
      <section id="embed" className="px-5 sm:px-8 py-20 bg-[color-mix(in_srgb,var(--color-accent)_4%,var(--color-background))] border-y border-border flex flex-col items-center">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-accent mb-3">One-line install</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 text-center">Add it to your site</h2>
        <p className="text-foreground-2 text-sm mb-10 text-center max-w-md">
          Paste one snippet into your HTML. Loads async — never blocks your page.
        </p>

        <div className="w-full max-w-2xl rounded-xl overflow-hidden border border-white/6 shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 bg-[#161412]">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs font-mono text-white/40">index.html</span>
            </div>
            <CopyButton text={EMBED_SNIPPET} />
          </div>
          <pre className="bg-[#0D0B0A] text-[#E07855] text-xs sm:text-sm leading-relaxed p-6 overflow-x-auto font-mono">
            <code>{EMBED_SNIPPET}</code>
          </pre>
        </div>
        <p className="mt-5 text-xs text-foreground-2">Works on Webflow, WordPress, Squarespace, and plain HTML.</p>
      </section>

      {/* ── Pricing comparison ── */}
      <section id="pricing" className="px-5 sm:px-8 py-24 flex flex-col items-center">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-accent mb-3">Why AI support</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-center">The economics are obvious</h2>
        <p className="text-foreground-2 text-center max-w-sm mb-12 leading-relaxed text-sm">
          Replace a $4,000/mo headcount with $50 in API costs — and get better coverage.
        </p>

        <div className="w-full max-w-lg rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="grid grid-cols-3 px-6 py-3.5 bg-[color-mix(in_srgb,var(--color-foreground)_4%,transparent)] border-b border-border">
            <span className="text-xs font-bold text-foreground-2 uppercase tracking-wide">Option</span>
            <span className="text-xs font-bold text-foreground-2 uppercase tracking-wide text-center">Monthly cost</span>
            <span className="text-xs font-bold text-foreground-2 uppercase tracking-wide text-right">Coverage</span>
          </div>
          {[
            { label: "Virtual assistant", cost: "~$2,000", coverage: "4–6 hr delays", hi: false },
            { label: "Support agent",     cost: "~$4,000", coverage: "One timezone",  hi: false },
            { label: "SupportPilot AI",   cost: "~$50",    coverage: "24/7 global",   hi: true  },
          ].map((row) => (
            <div
              key={row.label}
              className={[
                "grid grid-cols-3 px-6 py-4 border-b border-border last:border-0 items-center",
                row.hi ? "bg-accent-soft" : "bg-panel",
              ].join(" ")}
            >
              <span className={`text-sm font-semibold ${row.hi ? "text-accent" : "text-foreground"}`}>{row.label}</span>
              <span className={`text-sm font-bold text-center ${row.hi ? "text-accent" : "text-foreground"}`}>{row.cost}</span>
              <div className="flex justify-end">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${row.hi ? "bg-accent text-accent-fg" : "text-foreground-2"}`}>
                  {row.coverage}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Built with ── */}
      <section className="px-5 sm:px-8 py-14 border-t border-border flex flex-col items-center bg-[color-mix(in_srgb,var(--color-foreground)_2%,transparent)]">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-foreground-2 mb-8">Built with</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { label: "Next.js 16",        bg: "bg-black text-white"       },
            { label: "Gemini 2.5 Flash",  bg: "bg-blue-600 text-white"    },
            { label: "Vercel AI SDK v6",  bg: "bg-[#1C1917] text-white"   },
            { label: "Tailwind CSS v4",   bg: "bg-cyan-500 text-white"    },
            { label: "Framer Motion",     bg: "bg-purple-600 text-white"  },
            { label: "TypeScript",        bg: "bg-blue-700 text-white"    },
          ].map((t) => (
            <span key={t.label} className={`text-xs font-semibold px-4 py-2 rounded-full ${t.bg}`}>
              {t.label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="relative px-5 sm:px-8 py-28 flex flex-col items-center text-center overflow-hidden border-t border-border">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "radial-gradient(ellipse 70% 70% at 50% 110%, color-mix(in srgb, var(--color-accent) 12%, transparent), transparent)" }}
          aria-hidden
        />
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-accent mb-4">Work with Anil</span>
        <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-5 max-w-xl leading-tight">
          Want one for your business?
        </h2>
        <p className="text-foreground-2 text-base max-w-md mb-10 leading-relaxed">
          I build custom AI support agents in 24 hours — trained on your docs, styled to your brand, deployed live.
        </p>
        <a
          href="https://calendly.com/anilpervaiz/15min"
          target="_blank"
          rel="noopener noreferrer"
          className="h-14 px-10 rounded-full bg-accent text-accent-fg font-bold text-base flex items-center gap-2 hover:opacity-90 transition-opacity shadow-xl shadow-[color-mix(in_srgb,var(--color-accent)_30%,transparent)]"
        >
          Book a free 15-min call
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
        <p className="mt-4 text-sm text-foreground-2">No commitment. Just a conversation.</p>
      </section>

      {/* ── Footer ── */}
      <footer className="px-5 sm:px-8 py-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground-2">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center text-accent-fg text-[10px] font-bold">P</div>
            <span>
              Built by{" "}
              <a href="https://anilpervaiz.com" target="_blank" rel="noopener noreferrer" className="text-accent font-semibold hover:underline">
                Anil Pervaiz
              </a>
              {" "}— full-stack AI architect
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/admin" className="hover:text-foreground transition-colors">Dashboard</a>
            <a href="/embed" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Widget</a>
            <a href="https://github.com/anilandcode/supportpilot-demo" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
