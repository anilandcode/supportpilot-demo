import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { CopyButton } from "@/components/ui/copy-button";
import { ChatWindow } from "@/components/chat/chat-window";
import { WidgetBubble } from "@/components/ui/widget-demo";
import { theme } from "@/lib/theme";
import { FileText, Sparkles, Monitor, Calendar } from "lucide-react";

const EMBED_SNIPPET = `<script async src="https://supportpilot-demo.vercel.app/widget.js" data-workspace="wk_demo_acmedesk" data-accent="${theme.colors.accent}"></script>`;
const IFRAME_SNIPPET = `<iframe src="https://supportpilot-demo.vercel.app/embed?workspace=wk_demo_acmedesk" width="400" height="620" style="border:0;border-radius:18px"></iframe>`;

// ─── Static hero chat preview ─────────────────────────────────────────────────

function HeroChatPreview() {
  return (
    <div
      className="max-w-md mx-auto rounded-[20px] border border-border p-5 shadow-2xl"
      style={{
        background: "var(--card)",
        boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
      }}
    >
      {/* Bot message 1 */}
      <div className="flex gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-[11px] font-bold shrink-0 mt-0.5">
          {theme.botName[0]}
        </div>
        <div
          className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[13px] leading-relaxed text-foreground border border-border"
          style={{ background: "var(--card-elevated)" }}
        >
          Hey! I&apos;m {theme.botName}. I can answer questions about pricing, features,
          integrations, or billing.
        </div>
      </div>

      {/* User message */}
      <div className="flex justify-end mb-4">
        <div className="bg-accent text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-[13px] leading-relaxed max-w-[78%]">
          How much does Pro cost?
        </div>
      </div>

      {/* Bot message 2 */}
      <div className="flex gap-3 mb-5">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-[11px] font-bold shrink-0 mt-0.5">
          {theme.botName[0]}
        </div>
        <div className="flex flex-col gap-2">
          <div
            className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[13px] leading-relaxed text-foreground border border-border"
            style={{ background: "var(--card-elevated)" }}
          >
            Pro is{" "}
            <strong className="text-foreground font-semibold">
              $12/user/month
            </strong>{" "}
            — or $9.60 with annual billing (20% off).
          </div>
          <span
            className="self-start inline-flex items-center gap-1.5 text-[11px] font-medium rounded-full px-3 py-1 border"
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent)",
              borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)",
            }}
          >
            → Pricing Plans
          </span>
        </div>
      </div>

      {/* Fake input */}
      <div
        className="flex items-center gap-2.5 rounded-full border border-border px-4 py-2.5"
        style={{ background: "var(--background)" }}
      >
        <span className="flex-1 text-[13px]" style={{ color: "var(--foreground-3)" }}>
          Ask a question…
        </span>
        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z" />
          </svg>
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
      <section className="pt-32 pb-24 px-6 flex flex-col items-center text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.08em] mb-8"
            style={{ color: "var(--accent)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden />
            AI-powered · 24/7 · Trained on your docs
          </div>

          {/* Headline */}
          <h1
            className="text-[40px] sm:text-[60px] font-semibold tracking-[-0.03em] leading-[1.05] text-foreground"
          >
            Stop answering the same{" "}
            <span className="text-accent">questions.</span>
            <br />
            Let AI do it.
          </h1>

          {/* Subtitle */}
          <p
            className="text-[18px] mt-6 max-w-2xl mx-auto leading-[1.6]"
            style={{ color: "var(--foreground-2)" }}
          >
            {theme.productName} is a 24/7 AI support agent trained on your docs. It
            answers instantly, cites sources, and escalates to humans when it
            matters.
          </p>

          {/* CTA row */}
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <a
              href="#demo"
              className="bg-accent text-white text-[15px] font-medium px-5 py-3 rounded-full hover:bg-accent-hover transition-colors"
            >
              Try the demo →
            </a>
            <a
              href={theme.escalation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground text-[15px] font-medium px-5 py-3 rounded-full border border-border-strong hover:bg-card transition-colors"
            >
              Book a call
            </a>
          </div>

          {/* Social proof */}
          <p
            className="flex items-center gap-2 text-[13px] mt-6"
            style={{ color: "var(--foreground-3)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden />
            White-label setup for {theme.company} is live now.
          </p>
        </div>
      </section>

      {/* ── Hero chat preview ── */}
      <div className="px-6 -mt-4 pb-24">
        <HeroChatPreview />
      </div>

      {/* ── Stats bar ── */}
      <section className="bg-background border-t border-b border-border py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 divide-x divide-border">
          {[
            { value: "70%",  label: "Questions deflected", sub: "vs. human agents" },
            { value: "$2K+", label: "Saved per month",     sub: "vs. a support VA"  },
            { value: "< 3s", label: "Response time",       sub: "around the clock"  },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center px-4">
              <span className="text-[48px] font-semibold text-foreground tracking-tight leading-none">{s.value}</span>
              <span className="text-[13px] uppercase tracking-wider text-foreground-2 mt-3">{s.label}</span>
              <span className="text-[12px] text-foreground-3 mt-1">{s.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[12px] uppercase tracking-[0.08em] text-accent mb-3 block">How it works</span>
            <h2 className="text-[36px] font-semibold tracking-tight text-foreground">Live in three steps</h2>
            <p className="text-foreground-2 mt-3 max-w-xl mx-auto text-[15px] leading-relaxed">
              No engineers required. Go from zero to a live support bot in under 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            {[
              {
                n: "01",
                Icon: FileText,
                title: "Upload your docs",
                desc: "Paste your FAQ, drop in Markdown files, or connect a Notion page. The bot learns from whatever you have.",
              },
              {
                n: "02",
                Icon: Sparkles,
                title: "Customise voice & brand",
                desc: "Set the bot's name, personality, and colors. Wire an escalation path to Calendly, email, or Slack.",
              },
              {
                n: "03",
                Icon: Monitor,
                title: "Embed on your site",
                desc: "Copy one script snippet or use the iframe fallback. Works on Webflow, WordPress, Shopify, Squarespace, and plain HTML.",
              },
            ].map(({ n, Icon, title, desc }) => (
              <div
                key={n}
                className="relative bg-card border border-border rounded-[20px] p-8 hover:border-border-strong transition-colors overflow-hidden"
              >
                <span className="absolute top-6 right-6 text-[40px] font-semibold text-foreground-3 opacity-30 select-none leading-none pointer-events-none">
                  {n}
                </span>
                <Icon className="w-6 h-6 text-accent" aria-hidden />
                <h3 className="text-[18px] font-semibold text-foreground mt-12">{title}</h3>
                <p className="text-[14px] text-foreground-2 mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live demo ── */}
      <section id="demo" className="py-24 px-6 bg-surface">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[12px] uppercase tracking-[0.08em] text-accent mb-3 block">Live demo</span>
            <h2 className="text-[36px] font-semibold tracking-tight text-foreground">Try {theme.botName} right now</h2>
            <p className="text-foreground-2 mt-3 text-[15px] leading-relaxed max-w-lg mx-auto">
              Real answers from {theme.company}&apos;s docs. Ask anything about pricing, features, integrations, billing, or security.
            </p>
          </div>

          <div
            className="border border-border rounded-[20px] overflow-hidden"
            style={{ background: "var(--card)", height: "600px" }}
          >
            <ChatWindow />
          </div>
        </div>
      </section>

      {/* ── Widget preview ── */}
      <section id="widget" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[12px] uppercase tracking-[0.08em] text-accent mb-3 block">Embeddable widget</span>
            <h2 className="text-[36px] font-semibold tracking-tight text-foreground">Floats on any page</h2>
            <p className="text-foreground-2 mt-3 max-w-xl mx-auto text-[15px] leading-relaxed">
              A bubble sits in the corner of your site. One tap opens the full chat — zero friction for visitors.
            </p>
          </div>

          <div className="bg-card border border-border rounded-[16px] overflow-hidden max-w-2xl mx-auto">
            {/* Browser chrome */}
            <div className="h-9 bg-surface border-b border-border flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: "#EF4444" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#EAB308" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#22C55E" }} />
              </div>
              <div
                className="inline-flex items-center gap-2 rounded-md px-3 h-6 text-[12px] text-foreground-3 font-mono ml-2"
                style={{ background: "var(--card-elevated)" }}
              >
                yoursite.com/pricing
              </div>
            </div>

            {/* Body */}
            <div className="relative bg-surface" style={{ height: 400 }}>
              {/* Placeholder content */}
              <div className="px-8 pt-8 flex flex-col gap-3">
                <div className="h-3 w-1/3 rounded bg-border" />
                <div className="h-3 w-1/2 rounded bg-border" />
                <div className="h-3 w-2/5 rounded bg-border" />
                <div className="mt-4 h-3 w-11/12 rounded bg-border" />
                <div className="h-3 w-4/5 rounded bg-border" />
                <div className="h-3 w-3/4 rounded bg-border" />
                <div className="mt-4 flex gap-3">
                  <div className="h-8 w-28 rounded-lg bg-border" />
                  <div className="h-8 w-20 rounded-lg" style={{ background: "color-mix(in srgb, var(--border) 50%, transparent)" }} />
                </div>
              </div>

              {/* Callout label */}
              <div className="absolute bottom-24 right-6 bg-foreground text-background text-[12px] font-medium rounded-lg px-3 py-1.5 shadow-lg whitespace-nowrap pointer-events-none">
                Click to preview ↗
              </div>

              {/* Interactive bubble */}
              <WidgetBubble />
            </div>
          </div>
        </div>
      </section>

      {/* ── One-line install ── */}
      <section id="install" className="py-24 px-6 bg-surface">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[12px] uppercase tracking-[0.08em] text-accent mb-3 block">One-line install</span>
            <h2 className="text-[36px] font-semibold tracking-tight text-foreground">Add it to your site</h2>
            <p className="text-foreground-2 mt-3 text-[15px] leading-relaxed max-w-lg mx-auto">
              Paste one snippet into your HTML. Loads async — never blocks your page.
            </p>
          </div>

          <div className="rounded-[16px] border border-border overflow-hidden" style={{ background: "#0E0E0E" }}>
            {/* Header bar */}
            <div className="h-10 bg-surface border-b border-border flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: "#EF4444" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "#EAB308" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "#22C55E" }} />
                </div>
                <span className="text-[12px] font-mono text-foreground-3">index.html</span>
              </div>
              <CopyButton text={EMBED_SNIPPET} />
            </div>

            <pre className="p-6 font-mono text-[13px] leading-relaxed overflow-x-auto" style={{ color: "#E5E5E5" }}>
              <code>{EMBED_SNIPPET}</code>
            </pre>
          </div>

          <p className="text-[13px] text-foreground-3 text-center mt-5 break-words">
            Iframe fallback: <code className="font-mono">{IFRAME_SNIPPET}</code>
          </p>
        </div>
      </section>

      {/* ── Pricing tiers ── */}
      <section id="economics" className="py-24 px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[12px] uppercase tracking-[0.08em] text-accent mb-3 block">Lite vs Enterprise</span>
            <h2 className="text-[36px] font-semibold tracking-tight text-foreground">Start simple, upgrade when support volume grows</h2>
            <p className="text-foreground-2 mt-3 text-[15px] leading-relaxed max-w-lg mx-auto">
              The same UI runs against a low-cost docs engine or a vector RAG backend with analytics and ingestion.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                name: "Lite",
                price: "$150-400 setup",
                description: "Gemini, Markdown docs, cited answers, script embed, and human escalation.",
                points: ["No database required", "Best for FAQs and small help centers", "Runs from /knowledge files"],
              },
              {
                name: "Enterprise",
                price: "$1.5k+ build",
                description: "Vector RAG, Supabase ingestion, analytics, guardrails, and multi-source docs.",
                points: ["pgvector-ready retriever boundary", "Stats and feedback endpoints", "PDF/site/Notion ingestion path"],
              },
            ].map((tier) => (
              <div key={tier.name} className="rounded-[16px] border border-border bg-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{tier.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground-2">{tier.description}</p>
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                    {tier.price}
                  </span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-foreground-2">
                  {tier.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Built with ── */}
      <section className="py-16 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[12px] uppercase tracking-wider font-medium text-foreground-3 mb-8">Built with</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: "Next.js 16",       dot: "var(--foreground)"  },
              { label: "Gemini 2.5 Flash", dot: "#4285F4"            },
              { label: "Vercel AI SDK v6", dot: "var(--foreground)"  },
              { label: "Tailwind CSS v4",  dot: "#06B6D4"            },
              { label: "Framer Motion",    dot: "#8B5CF6"            },
              { label: "TypeScript",       dot: "#3178C6"            },
            ].map(({ label, dot }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 text-[13px] text-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} aria-hidden />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative py-32 px-6 overflow-hidden border-t border-border">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 120%, color-mix(in srgb, var(--accent) 10%, transparent), transparent)" }}
          aria-hidden
        />
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-[12px] uppercase tracking-[0.08em] text-accent mb-4 block">Work with Anil</span>
          <h2 className="text-[44px] font-semibold tracking-tight text-foreground leading-[1.1]">
            Want one for your business?
          </h2>
          <p className="text-foreground-2 text-[16px] mt-4 leading-relaxed max-w-md mx-auto">
            I build custom AI support agents in 24 hours — trained on your docs, styled to your brand, deployed live.
          </p>
          <div className="mt-10">
            <a
              href={theme.escalation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-accent text-white text-[15px] font-medium px-7 py-4 rounded-full hover:bg-accent-hover transition-colors"
              style={{ boxShadow: "0 8px 32px color-mix(in srgb, var(--accent) 30%, transparent)" }}
            >
              <Calendar className="w-4 h-4" aria-hidden />
              Book a free 15-min call
            </a>
          </div>
          <p className="text-foreground-3 text-[13px] mt-4">No commitment. Just a conversation.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
