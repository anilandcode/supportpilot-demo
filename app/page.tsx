import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CopyButton } from "@/components/ui/copy-button";
import { ChatWindow } from "@/components/chat/chat-window";

const EMBED_SNIPPET = `<iframe
  src="https://supportpilot-demo.vercel.app/embed"
  width="500px"
  height="700px"
  frameborder="0"
  allowtransparency="true"
  style="position:fixed;bottom:0;right:0;border:none;z-index:9999"
></iframe>`;

// ─── Hero chat preview ────────────────────────────────────────────────────────

function HeroChatPreview() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-panel shadow-2xl overflow-hidden text-left">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-panel">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-fg text-xs font-bold shrink-0">
          P
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-foreground">Pilot · Linear-clone Support</p>
          <p className="text-[10px] text-foreground-2 flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Online — replies in seconds
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="px-4 py-4 flex flex-col gap-3 bg-background">
        <div className="flex gap-2 items-end">
          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-accent-fg text-[10px] font-bold shrink-0">
            P
          </div>
          <div className="bg-panel border border-border text-foreground text-xs rounded-2xl rounded-bl-sm px-3 py-2 max-w-[80%] leading-relaxed">
            Hi! I&apos;m Pilot 👋 Ask me anything about Linear-clone — pricing, features, integrations.
          </div>
        </div>

        <div className="flex justify-end">
          <div className="bg-accent text-accent-fg text-xs rounded-2xl rounded-br-sm px-3 py-2 max-w-[75%] leading-relaxed">
            How much does Pro cost?
          </div>
        </div>

        <div className="flex gap-2 items-end">
          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-accent-fg text-[10px] font-bold shrink-0">
            P
          </div>
          <div className="bg-panel border border-border text-foreground text-xs rounded-2xl rounded-bl-sm px-3 py-2 max-w-[80%] leading-relaxed">
            <span>Pro is <strong>$12/user/mo</strong> — or $9.60 with annual billing.</span>
            <span className="mt-1.5 flex">
              <span className="bg-accent-soft text-accent text-[10px] font-medium rounded-full px-2 py-0.5 border border-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]">
                Source: Pricing Plans
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-panel">
        <div className="flex items-center gap-2 border border-border rounded-full px-3 py-2 bg-background">
          <span className="text-xs text-foreground-2 flex-1">Ask a question…</span>
          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z" />
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

      {/* ── Nav ── */}
      <header className="sticky top-0 z-20 border-b border-border bg-[color-mix(in_srgb,var(--color-background)_85%,transparent)] backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-accent-fg text-xs font-bold">P</div>
            <span className="text-sm font-semibold text-foreground">SupportPilot</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#chat" className="text-sm text-foreground-2 hover:text-foreground transition-colors hidden sm:block">Demo</a>
            <a href="/admin" className="text-sm text-foreground-2 hover:text-foreground transition-colors hidden sm:block">Dashboard</a>
            <ThemeToggle />
            <a
              href="https://calendly.com/anilpervaiz/15min"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center h-8 px-4 rounded-full bg-accent text-accent-fg text-xs font-semibold hover:bg-[color-mix(in_srgb,var(--color-accent)_85%,black)] transition-colors"
            >
              Book a call
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-20 pb-24 flex flex-col items-center text-center">
        {/* Subtle radial gradient behind hero */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in srgb, var(--color-accent) 12%, transparent), transparent 70%)",
          }}
          aria-hidden
        />

        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent-soft text-accent border border-[color-mix(in_srgb,var(--color-accent)_25%,transparent)] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          AI-powered · Always on · Trained on your docs
        </span>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-3xl leading-[1.05] mb-6">
          Stop answering<br className="hidden sm:block" /> the same questions.
        </h1>

        <p className="text-lg sm:text-xl text-foreground-2 max-w-lg leading-relaxed mb-10">
          SupportPilot is a 24/7 AI support agent trained on your docs.
          It answers instantly, cites its sources, and hands off to humans when it matters.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          <a
            href="#chat"
            className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-accent text-accent-fg font-semibold text-sm transition-colors hover:bg-[color-mix(in_srgb,var(--color-accent)_85%,black)] shadow-lg shadow-[color-mix(in_srgb,var(--color-accent)_30%,transparent)]"
          >
            Try the demo →
          </a>
          <a
            href="https://calendly.com/anilpervaiz/15min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-border text-foreground font-semibold text-sm transition-colors hover:bg-[color-mix(in_srgb,var(--color-foreground)_5%,transparent)]"
          >
            Book a call
          </a>
        </div>

        {/* Hero preview */}
        <div className="relative w-full flex justify-center">
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" aria-hidden />
          <HeroChatPreview />
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-border">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 divide-x divide-border">
          {[
            { value: "70%", label: "Repetitive questions deflected" },
            { value: "$2K/mo", label: "Avg. savings vs. a support VA" },
            { value: "< 24h", label: "From zero to live chatbot" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center py-10 px-4 text-center">
              <span className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">{s.value}</span>
              <span className="mt-2 text-xs sm:text-sm text-foreground-2 max-w-[120px] leading-snug">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-6 py-24 flex flex-col items-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">How it works</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-16">
          Live in three steps
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl w-full relative">
          {/* Connecting line on desktop */}
          <div className="hidden sm:block absolute top-5 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px bg-border" aria-hidden />

          {[
            {
              step: "01",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
              ),
              title: "Upload your docs",
              desc: "Paste your FAQ, drop in Markdown files, or point to a Notion page. The bot learns from whatever you have.",
            },
            {
              step: "02",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              ),
              title: "Customise voice & brand",
              desc: "Set the bot's name, personality, and colors. Wire up an escalation path to Calendly, email, or Slack.",
            },
            {
              step: "03",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                </svg>
              ),
              title: "Embed on your site",
              desc: "Copy one iframe snippet or share a hosted link. Works on Webflow, WordPress, Squarespace — any platform.",
            },
          ].map((item) => (
            <div key={item.step} className="flex flex-col gap-4 relative">
              <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0 border border-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] relative z-10 bg-background">
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-mono text-foreground-2 font-medium mb-1">{item.step}</p>
                <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-foreground-2 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live chat demo ── */}
      <section id="chat" className="px-4 sm:px-6 py-20 flex flex-col items-center border-t border-border bg-[color-mix(in_srgb,var(--color-accent)_3%,var(--color-background))]">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Live demo</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-center">
          Try Pilot right now
        </h2>
        <p className="text-foreground-2 text-sm mb-8 text-center max-w-md">
          Real bot, real AI — trained on Linear-clone&apos;s docs. Ask it anything.
        </p>

        <div className="w-full max-w-2xl rounded-2xl overflow-hidden border border-border shadow-xl shadow-[color-mix(in_srgb,var(--color-foreground)_5%,transparent)] h-[600px]">
          <ChatWindow />
        </div>
      </section>

      {/* ── Widget preview ── */}
      <section className="px-4 sm:px-6 py-20 flex flex-col items-center border-t border-border">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Embeddable widget</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-center">Floats on any page</h2>
        <p className="text-foreground-2 text-sm mb-10 text-center max-w-md">
          A bubble sits in the corner of your site. One tap opens the full chat — same Pilot experience, zero friction for visitors.
        </p>

        <div className="relative w-full max-w-2xl rounded-2xl border border-border overflow-hidden bg-panel">
          {/* Fake browser chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-background">
            <div className="w-3 h-3 rounded-full bg-[color-mix(in_srgb,var(--color-foreground)_12%,transparent)]" />
            <div className="w-3 h-3 rounded-full bg-[color-mix(in_srgb,var(--color-foreground)_12%,transparent)]" />
            <div className="w-3 h-3 rounded-full bg-[color-mix(in_srgb,var(--color-foreground)_12%,transparent)]" />
            <div className="flex-1 mx-4 h-5 rounded bg-[color-mix(in_srgb,var(--color-foreground)_6%,transparent)] flex items-center px-3">
              <span className="text-[10px] text-foreground-2">yoursite.com</span>
            </div>
          </div>

          {/* Page content mockup */}
          <div className="h-52 px-8 py-6 flex flex-col gap-3 select-none pointer-events-none">
            <div className="w-48 h-3 rounded-full bg-[color-mix(in_srgb,var(--color-foreground)_10%,transparent)]" />
            <div className="w-64 h-2.5 rounded-full bg-[color-mix(in_srgb,var(--color-foreground)_6%,transparent)]" />
            <div className="w-56 h-2.5 rounded-full bg-[color-mix(in_srgb,var(--color-foreground)_6%,transparent)]" />
            <div className="mt-2 w-32 h-8 rounded-lg bg-[color-mix(in_srgb,var(--color-foreground)_8%,transparent)]" />
          </div>

          {/* Widget bubble */}
          <a
            href="/embed"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open widget preview"
            className="absolute bottom-5 right-5 w-14 h-14 rounded-full bg-accent text-accent-fg shadow-lg shadow-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] flex items-center justify-center hover:scale-105 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </svg>
          </a>
          <div className="absolute bottom-7 right-24 text-xs text-foreground-2 bg-panel border border-border rounded-full px-3 py-1.5 shadow-sm">
            Click to preview ↗
          </div>
        </div>
      </section>

      {/* ── Embed code ── */}
      <section id="embed" className="px-4 sm:px-6 py-20 flex flex-col items-center border-t border-border bg-[color-mix(in_srgb,var(--color-accent)_3%,var(--color-background))]">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">One-line install</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-center">Add it to your site</h2>
        <p className="text-foreground-2 text-sm mb-8 text-center max-w-md">
          Paste one snippet into your HTML. Loads async — never blocks your page.
        </p>

        <div className="w-full max-w-2xl rounded-xl overflow-hidden border border-border shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a1a]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="text-xs font-mono text-white/40 ml-2">index.html</span>
            </div>
            <CopyButton text={EMBED_SNIPPET} />
          </div>
          <pre className="bg-[#111] text-green-400 text-xs sm:text-sm leading-relaxed p-5 overflow-x-auto font-mono">
            <code>{EMBED_SNIPPET}</code>
          </pre>
        </div>
        <p className="mt-4 text-xs text-foreground-2 text-center">
          Works on Webflow, WordPress, Squarespace, and plain HTML.
        </p>
      </section>

      {/* ── Built with ── */}
      <section className="px-6 py-14 flex flex-col items-center border-t border-border">
        <p className="text-xs font-semibold uppercase tracking-widest text-foreground-2 mb-8">Built with</p>
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-2xl">
          {[
            { label: "Next.js 16", color: "bg-black text-white" },
            { label: "Gemini 2.5 Flash", color: "bg-blue-600 text-white" },
            { label: "Vercel AI SDK v6", color: "bg-foreground text-background" },
            { label: "Tailwind CSS v4", color: "bg-cyan-500 text-white" },
            { label: "Framer Motion", color: "bg-purple-600 text-white" },
            { label: "TypeScript", color: "bg-blue-700 text-white" },
          ].map((tech) => (
            <span
              key={tech.label}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold ${tech.color}`}
            >
              {tech.label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Cost comparison ── */}
      <section className="px-6 py-20 flex flex-col items-center border-t border-border bg-[color-mix(in_srgb,var(--color-accent)_3%,var(--color-background))]">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Why AI support</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-10 text-center">The economics are obvious</h2>

        <div className="w-full max-w-lg rounded-2xl border border-border overflow-hidden bg-panel shadow-sm">
          <div className="grid grid-cols-3 px-5 py-3 border-b border-border bg-background">
            <span className="text-xs font-semibold text-foreground-2">Option</span>
            <span className="text-xs font-semibold text-foreground-2 text-center">Monthly cost</span>
            <span className="text-xs font-semibold text-foreground-2 text-right">Coverage</span>
          </div>
          {[
            { label: "Virtual assistant", cost: "~$2,000", coverage: "4–6 hr delays", highlight: false },
            { label: "Support agent", cost: "~$4,000", coverage: "One timezone", highlight: false },
            { label: "SupportPilot AI", cost: "~$50", coverage: "24/7 global", highlight: true },
          ].map((row) => (
            <div
              key={row.label}
              className={[
                "grid grid-cols-3 px-5 py-4 border-b border-border last:border-0",
                row.highlight ? "bg-accent-soft" : "",
              ].join(" ")}
            >
              <span className={`text-sm font-medium ${row.highlight ? "text-accent" : "text-foreground"}`}>
                {row.label}
              </span>
              <span className={`text-sm font-bold text-center ${row.highlight ? "text-accent" : "text-foreground"}`}>
                {row.cost}
              </span>
              <span className={`text-sm text-right ${row.highlight ? "text-accent font-medium" : "text-foreground-2"}`}>
                {row.coverage}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="px-6 py-24 flex flex-col items-center text-center border-t border-border relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 100%, color-mix(in srgb, var(--color-accent) 10%, transparent), transparent 70%)",
          }}
          aria-hidden
        />
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Want one for your business?
        </h2>
        <p className="text-foreground-2 text-base max-w-md mb-10 leading-relaxed">
          I build custom AI support agents in 24 hours — trained on your docs,
          styled to your brand, deployed live.
        </p>
        <a
          href="https://calendly.com/anilpervaiz/15min"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-14 px-10 rounded-full bg-accent text-accent-fg font-bold text-base transition-colors hover:bg-[color-mix(in_srgb,var(--color-accent)_85%,black)] shadow-xl shadow-[color-mix(in_srgb,var(--color-accent)_30%,transparent)]"
        >
          Book a free 15-min call →
        </a>
        <p className="mt-4 text-sm text-foreground-2">No commitment. Just a conversation.</p>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center text-accent-fg text-[10px] font-bold">P</div>
            <span>
              Built by{" "}
              <a href="https://anilpervaiz.com" target="_blank" rel="noopener noreferrer" className="text-accent font-medium hover:underline">
                Anil Pervaiz
              </a>{" "}
              — full-stack AI architect
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
