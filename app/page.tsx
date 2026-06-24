import { Footer } from "@/components/layout/footer";
import { Nav } from "@/components/layout/nav";
import { theme } from "@/lib/theme";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  Database,
  FileText,
  Gauge,
  GitBranch,
  Headphones,
  LockKeyhole,
  MessageSquare,
  Route,
  ShieldCheck,
  Sparkles,
  Users2,
  Workflow,
  Zap,
} from "lucide-react";

const stats = [
  ["24/7", "AI first response", "Always-on support for common questions."],
  ["3 min", "Guided setup", "Add docs, tune voice, embed widget."],
  ["0", "Risky auto-sends", "Approval gates for refunds, billing, SSO, privacy, and data residency."],
  ["100%", "Source-visible answers", "Every factual answer should show the docs it used."],
] as const;

const steps = [
  ["Upload your knowledge", "Paste FAQs, import Markdown, add help docs, and organize sources by workspace.", FileText],
  ["Configure brand and voice", "Set logo, colors, tone, welcome message, and domain allowlist.", Sparkles],
  ["Set approval rules", "Decide which topics need review: refunds, billing, SSO, security, legal, and data residency.", ShieldCheck],
  ["Embed and go live", "Drop in the widget script, test the live demo, and monitor tickets from the admin console.", Zap],
] as const;

const useCases = [
  ["SaaS support deflection", "Answer setup, pricing, account, and troubleshooting questions from your docs.", MessageSquare],
  ["Billing and refund triage", "Draft policy-aware responses and route refund requests for manager approval.", CircleDollarSign],
  ["SSO and security onboarding", "Help enterprise buyers with SAML, DPA, data residency, and access questions without guessing.", LockKeyhole],
  ["Agency white-label support", "Launch a branded support widget per client workspace, with domains, roles, and policy controls.", Users2],
  ["Internal support copilot", "Help human agents draft cited replies, find missing docs, and speed up ticket resolution.", Bot],
  ["Product feedback loop", "Identify missing knowledge, recurring intents, and docs that need refresh.", BarChart3],
] as const;

const features = [
  ["Cited answers from your knowledge base", "Every answer shows the source chunks behind it.", Database],
  ["Confidence scoring", "Retrieval strength, citation coverage, source freshness, and risk category inform the decision.", Gauge],
  ["Approval queue", "Refunds, SSO, billing, privacy, legal, and low-confidence drafts wait for manager review.", Workflow],
  ["Human handoff", "Escalate by email, Slack, Calendly, Zendesk, or helpdesk route.", Headphones],
  ["Action-ready architecture", "Start with read-only actions, then add approval-gated tool calling when the team is ready.", GitBranch],
  ["Small-model routing", "Use low-cost routes for classification, PII, rewrite, and easy answers; reserve stronger models for hard cases.", Route],
] as const;

const trustCards = [
  ["RBAC and workspaces", "Owners, admins, managers, agents, and viewers get role-appropriate access."],
  ["Domain allowlists", "Widgets only run on verified domains with tenant-specific configuration."],
  ["Audit logs", "Track source changes, approval decisions, model routes, tool calls, and policy changes."],
  ["PII-aware routing", "Redact sensitive prompts and keep risky requests out of raw analytics."],
  ["SSO/SAML ready", "Enterprise plan adds SAML/SSO, SCIM-ready provisioning, and access-review workflows."],
  ["Data residency path", "Advanced tenants can move toward region-specific storage and provider routing."],
] as const;

const integrationGroups = [
  ["Knowledge", ["Docs", "Markdown", "Notion", "Help Center", "PDF/DOCX"]],
  ["Handoff", ["Email", "Slack", "Calendly"]],
  ["Helpdesk", ["Zendesk", "Intercom", "Gorgias", "Freshdesk"]],
  ["Business actions", ["Stripe", "HubSpot", "Salesforce", "Linear/Jira"]],
  ["Developer", ["Webhooks", "API keys", "Vercel AI SDK tools"]],
] as const;

const pricing = [
  {
    name: "Launch",
    price: "$49/mo",
    bestFor: "Solo SaaS, small teams, first client pilots.",
    cta: "Start Launch",
    featured: false,
    features: ["1 workspace", "Branded widget", "Pasted/Markdown knowledge", "Cited answers", "Basic tickets", "Email escalation", "Simple approvals", "Basic analytics"],
  },
  {
    name: "Pro",
    price: "$149/mo",
    bestFor: "Growing SaaS and support teams.",
    cta: "Start Pro",
    featured: true,
    features: ["3 workspaces", "Multi-source ingestion", "Approval policies", "Slack/Calendly handoff", "Role-based members", "Advanced analytics", "Model route logging", "Domain allowlist"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    bestFor: "Regulated or high-volume support orgs.",
    cta: "Talk to sales",
    featured: false,
    features: ["SSO/SAML", "Custom roles", "Audit exports", "Data residency options", "Advanced integrations", "Approval-gated actions", "Dedicated onboarding", "Model/provider policy"],
  },
] as const;

const faqs = [
  ["How does SupportPilot avoid hallucinations?", "It retrieves from your approved knowledge, cites the sources it used, checks confidence, and routes low-confidence or risky drafts for human review."],
  ["Can the widget match our brand?", "Yes. Configure logo, color, bot name, greeting, radius, theme mode, position, and allowed domains per workspace."],
  ["What counts as a risky request?", "Refunds, billing changes, SSO, security, privacy, legal, data residency, account deletion, and low-confidence answers should require approval by default."],
  ["Can SupportPilot take actions in other tools?", "Start with safe read-only or ticket-creation actions; advanced plans can add approval-gated tool calling for helpdesk, billing, CRM, and scheduling workflows."],
  ["Does it support humans in the loop?", "Yes. Drafts can be approved, edited, rejected, or escalated, and every decision is logged for auditability."],
  ["Is this SOC 2 compliant?", "Treat SOC 2 as an enterprise-readiness roadmap until formal controls, evidence, and audit work are complete."],
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <section className="marketing-hero relative overflow-hidden px-5 pb-16 pt-16 sm:px-6 lg:pb-20">
          <div className="pointer-events-none absolute left-[12%] top-16 h-52 w-52 rounded-full bg-[var(--brand-warm)]/24 blur-3xl pulse-soft" aria-hidden />
          <div className="pointer-events-none absolute right-[12%] top-20 h-64 w-64 rounded-full bg-[var(--brand-secondary)]/18 blur-3xl pulse-soft" aria-hidden />

          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <BadgeLine>White-label AI support • Cited answers • Human approval</BadgeLine>
              <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-[1.04] text-foreground sm:text-6xl lg:text-7xl">
                White-label AI support with cited answers and human approval built in.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground-2">
                SupportPilot turns your help docs, policies, and workflows into a 24/7 support agent. It answers with sources, scores confidence, and routes refunds, billing, SSO, and data-residency questions to the right human before anything risky goes out.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={theme.escalation.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-fg shadow-[0_18px_48px_rgba(109,86,255,.28)] transition-colors hover:bg-accent-hover">
                  Book a 20-minute demo
                  <Calendar className="ml-2 h-4 w-4" aria-hidden />
                </a>
                <a href="#demo" className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-white/75 px-6 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent">
                  Try the live widget
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </a>
              </div>
              <p className="mt-5 flex max-w-xl items-center gap-2 text-sm text-foreground-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--semantic-confidence-high)]" aria-hidden />
                Go live in 24 hours with your brand, your docs, and your escalation rules.
              </p>
            </div>

            <HeroProductMockup />
          </div>
        </section>

        <section id="product" className="border-y border-border bg-card px-5 py-10 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Built for teams that need support automation without losing control.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-2">
                  Works with your help center, docs, support inbox, Slack, calendar, and billing workflows.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["SaaS Support", "Fintech Onboarding", "B2B Helpdesk", "Marketplace Ops", "Agencies", "Enterprise IT"].map((label) => (
                  <span key={label} className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground-2">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-12 sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(([value, label, text]) => (
              <div key={label} className="lift-card rounded-3xl border border-border bg-card p-6">
                <p className="text-4xl font-bold text-foreground">{value}</p>
                <h3 className="mt-4 text-sm font-semibold">{label}</h3>
                <p className="mt-2 text-sm leading-6 text-foreground-2">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="px-5 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="How it works" title="From docs to live AI support in one guided workflow." text="SupportPilot keeps setup simple for launch, then lets enterprise teams add policies, integrations, model routing, and approvals as they grow." />
            <div className="mt-12 grid gap-4 lg:grid-cols-4">
              {steps.map(([title, text, Icon], index) => (
                <div key={title} className="rounded-3xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-accent" aria-hidden />
                    <span className="text-sm font-semibold text-foreground-3">0{index + 1}</span>
                  </div>
                  <h3 className="mt-8 text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-foreground-2">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="use-cases" className="bg-surface px-5 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="Use cases" title="One support agent for the questions that slow your team down." text="Start with low-risk answers, then add guarded actions and handoffs when your team is ready." />
            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {useCases.map(([title, text, Icon]) => (
                <MiniProductCard key={title} title={title} text={text} Icon={Icon} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="Agentic workflow" title="Not just chat. A governed support workflow." text="The agent retrieves evidence, drafts answers, checks confidence, follows policy, and asks humans to approve risky work." />
            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {features.map(([title, text, Icon]) => (
                <MiniProductCard key={title} title={title} text={text} Icon={Icon} />
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="bg-surface px-5 py-20 sm:px-6">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <BadgeLine>Live widget demo</BadgeLine>
              <h2 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">Try the same widget your customers will see.</h2>
              <p className="mt-4 text-base leading-7 text-foreground-2">
                Ask about refunds, SSO setup, billing, or data residency and watch SupportPilot cite sources or ask for approval.
              </p>
              <div className="mt-6 grid gap-2">
                {["Cited answer", "Confidence scored", "Approval required", "Human handoff ready"].map((label) => (
                  <div key={label} className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[var(--semantic-confidence-high)]" aria-hidden />
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <WidgetPreview />
          </div>
        </section>

        <section id="security" className="dark-proof px-5 py-20 text-white sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <BadgeLine dark>Security and trust</BadgeLine>
              <h2 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">Built for support teams that cannot afford hallucinated policy answers.</h2>
              <p className="mt-4 text-base leading-7 text-white/68">
                SupportPilot is designed around human review, tenant isolation, audit trails, source visibility, and security controls.
              </p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {trustCards.map(([title, text]) => (
                <div key={title} className="rounded-3xl border border-white/12 bg-white/8 p-6">
                  <ShieldCheck className="h-5 w-5 text-[var(--brand-warm)]" aria-hidden />
                  <h3 className="mt-5 font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/62">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="integrations" className="px-5 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="Integrations" title="Connect the tools your support team already uses." text="Start simple with docs, email, Slack, and Calendly; add helpdesk and workflow integrations as you scale." />
            <div className="mt-12 grid gap-4 lg:grid-cols-5">
              {integrationGroups.map(([group, items]) => (
                <div key={group} className="rounded-3xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold">{group}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {items.map((item) => (
                      <span key={item} className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-foreground-2">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface px-5 py-20 sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <SectionHeader eyebrow="Analytics" title="Know what AI resolved, what humans changed, and what docs are missing." text="Track deflection, AI acceptance, escalation rate, confidence distribution, cost per conversation, and missing-knowledge clusters." align="left" />
            <AnalyticsMockup />
          </div>
        </section>

        <section id="pricing" className="px-5 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="Pricing" title="Start with a branded support agent. Add enterprise controls when you need them." text="Every plan includes cited answers, a white-label widget, and an admin console. Higher tiers add advanced approvals, integrations, model routing, and security controls." />
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {pricing.map((plan) => (
                <div key={plan.name} className={`rounded-3xl border bg-card p-6 ${plan.featured ? "border-accent shadow-[0_24px_70px_rgba(109,86,255,.16)]" : "border-border"}`}>
                  {plan.featured && <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-fg">Most popular</span>}
                  <h3 className="mt-5 text-xl font-semibold">{plan.name}</h3>
                  <p className="mt-3 text-4xl font-bold">{plan.price}</p>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-foreground-2">{plan.bestFor}</p>
                  <a href={plan.name === "Enterprise" ? theme.escalation.url : "#demo"} className={`mt-6 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold ${plan.featured ? "bg-accent text-accent-fg hover:bg-accent-hover" : "border border-border text-foreground hover:border-accent hover:text-accent"}`}>
                    {plan.cta}
                  </a>
                  <ul className="mt-6 space-y-3 text-sm text-foreground-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--semantic-confidence-high)]" aria-hidden />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-3xl border border-border bg-surface p-5 text-sm text-foreground-2">
              Need agency white-label setup? Launch multiple client workspaces with governed themes and domains.
            </div>
          </div>
        </section>

        <section className="bg-surface px-5 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="Testimonials" title="Designed for operators who want automation without losing judgment." />
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {[
                ["SP", "SupportPilot gave us fast AI replies without forcing us to auto-send billing or security answers.", "Head of Support, B2B SaaS"],
                ["AQ", "The approval queue is the difference between a chatbot demo and something we can actually put in front of customers.", "Founder, SaaS agency"],
                ["SV", "Source visibility made our team trust the drafts faster.", "Support Ops Lead"],
              ].map(([initials, quote, role]) => (
                <figure key={quote} className="rounded-3xl border border-border bg-card p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">{initials}</div>
                  <blockquote className="mt-5 text-base leading-7 text-foreground">&quot;{quote}&quot;</blockquote>
                  <figcaption className="mt-5 text-sm text-foreground-2">{role}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="px-5 py-20 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <SectionHeader eyebrow="FAQ" title="Questions enterprise teams ask before turning on AI support." />
            <div className="mt-10 divide-y divide-border rounded-3xl border border-border bg-card">
              {faqs.map(([question, answer]) => (
                <details key={question} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold">
                    {question}
                    <span className="rounded-full border border-border px-2 py-1 text-xs text-foreground-3 group-open:bg-accent group-open:text-accent-fg">Open</span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-foreground-2">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="dark-proof px-5 py-20 text-white sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <h2 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">Put an AI support agent on your site without giving up control.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">
                Launch with your docs and brand first. Add approvals, integrations, analytics, and enterprise controls as your support volume grows.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={theme.escalation.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[var(--brand-primary-dark)]">
                  Book a demo
                </a>
                <a href="#demo" className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white hover:bg-white/10">
                  Try the widget
                </a>
              </div>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/8 p-5">
              <p className="text-sm font-semibold">Ready for review</p>
              <p className="mt-3 text-2xl font-bold">SSO setup draft</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <StatusPill tone="success">3 sources</StatusPill>
                <StatusPill tone="warning">Manager queue</StatusPill>
                <StatusPill tone="info">68% confidence</StatusPill>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function HeroProductMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[720px]">
      <div className="glass-card rounded-[32px] p-4">
        <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
            </div>
            <span className="text-xs font-medium text-foreground-3">SupportPilot / Overview</span>
          </div>
          <div className="grid min-h-[500px] lg:grid-cols-[150px_1fr]">
            <div className="hidden border-r border-border bg-surface p-4 lg:block">
              {["Overview", "Tickets", "Knowledge", "Approvals", "Analytics", "Settings"].map((item, index) => (
                <div key={item} className={`mb-2 rounded-xl px-3 py-2 text-xs font-medium ${index === 0 ? "bg-accent-soft text-accent" : "text-foreground-2"}`}>
                  {item}
                </div>
              ))}
            </div>
            <div className="p-4">
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  ["AI deflection", "64%"],
                  ["AI acceptance", "82%"],
                  ["Escalated", "18%"],
                  ["Cost/conversation", "$0.04"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-border bg-surface p-3">
                    <p className="text-[11px] text-foreground-3">{label}</p>
                    <p className="mt-2 text-xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_240px]">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Approval queue</h3>
                    <StatusPill tone="danger">Approval required</StatusPill>
                  </div>
                  <div className="mt-4 space-y-3">
                    {["Refund request", "Okta SSO setup", "Data residency"].map((item, index) => (
                      <div key={item} className="rounded-xl border border-border bg-surface p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold">{item}</p>
                          <span className="text-xs text-foreground-3">{index === 0 ? "76%" : index === 1 ? "68%" : "72%"}</span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-border">
                          <div className="h-full rounded-full bg-accent" style={{ width: index === 0 ? "76%" : index === 1 ? "68%" : "72%" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-xs font-semibold text-foreground-3">Missing knowledge</p>
                  <div className="mt-4 space-y-3">
                    {["Refund exception policy", "EU data residency", "Okta metadata"].map((topic) => (
                      <div key={topic} className="rounded-xl bg-card p-3 text-xs font-medium">
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="float-slow absolute -bottom-8 right-0 w-[310px] rounded-[28px] border border-border bg-card p-4 shadow-[0_24px_70px_rgba(15,23,42,.18)] max-sm:relative max-sm:bottom-auto max-sm:mt-4 max-sm:w-full">
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-fg">A</div>
          <div>
            <p className="text-sm font-semibold">Acme AI Support</p>
            <p className="text-xs text-foreground-3">Answers from Acme docs</p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-bubble-user px-4 py-3 text-sm">
          Can I get a refund on my annual plan?
        </div>
        <div className="mt-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm leading-6 text-foreground-2">
          I found the refund policy, but this needs manager approval before I send a final answer.
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusPill tone="warning">Refund policy</StatusPill>
          <StatusPill tone="info">Billing terms</StatusPill>
        </div>
      </div>
    </div>
  );
}

function WidgetPreview() {
  return (
    <div className="mx-auto max-w-[460px] rounded-[28px] border border-border bg-card p-4 shadow-[0_24px_80px_rgba(15,23,42,.16)]">
      <div className="rounded-[24px] border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-fg">A</div>
            <div>
              <p className="text-sm font-semibold">Acme AI Support</p>
              <p className="text-xs text-foreground-3">AI answers from Acme docs</p>
            </div>
          </div>
          <span className="rounded-full bg-[var(--badge-success-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--badge-success-text)]">Online</span>
        </div>
        <div className="space-y-3 p-4">
          {["What is your refund policy?", "How do I configure SSO with Okta?", "Where is customer data hosted?", "Can I delete all my data?"].map((prompt) => (
            <button key={prompt} className="w-full rounded-2xl border border-border bg-card px-3 py-2 text-left text-sm text-foreground-2 transition-colors hover:border-accent hover:text-accent">
              {prompt}
            </button>
          ))}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="warning">Approval required</StatusPill>
              <StatusPill tone="info">68% confidence</StatusPill>
            </div>
            <p className="mt-3 text-sm leading-6 text-foreground-2">
              SSO setup is marked as security-sensitive. I found the Okta guide and SAML checklist, then routed this draft to a support engineer.
            </p>
            <div className="mt-3 rounded-xl bg-surface p-3">
              <p className="text-xs font-semibold text-foreground-3">Citations</p>
              <p className="mt-2 text-sm">Okta SSO guide v3.4</p>
              <p className="mt-1 text-xs text-foreground-3">Fresh source • owner: Security Ops</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a href="/portal" className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-fg">Open portal</a>
            <a href="/admin" className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground-2">Admin view</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsMockup() {
  return (
    <div className="rounded-[28px] border border-border bg-card p-5 shadow-[0_24px_80px_rgba(15,23,42,.10)]">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Deflection", "64%"],
          ["Acceptance", "82%"],
          ["Escalation", "18%"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs text-foreground-3">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
        <div className="flex h-44 items-end gap-2">
          {[44, 62, 58, 74, 66, 82, 76, 88, 70, 92, 84, 96].map((height, index) => (
            <div key={`${height}-${index}`} className="flex-1 rounded-t-xl bg-accent" style={{ height: `${height}%`, opacity: 0.35 + index / 24 }} />
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {["Missing knowledge: refund exceptions", "Model fallback: R4 high-risk drafts", "Source stale rate: 8%", "Cost per accepted reply: $0.05"].map((item) => (
          <div key={item} className="rounded-xl bg-surface px-3 py-2 text-sm text-foreground-2">{item}</div>
        ))}
      </div>
    </div>
  );
}

function MiniProductCard({ title, text, Icon }: { title: string; text: string; Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }> }) {
  return (
    <div className="lift-card rounded-3xl border border-border bg-card p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="mt-6 text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-foreground-2">{text}</p>
      <div className="mt-6 rounded-2xl border border-border bg-surface p-3">
        <div className="h-2 w-3/4 rounded-full bg-border" />
        <div className="mt-2 h-2 w-1/2 rounded-full bg-border" />
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, text, align = "center" }: { eyebrow: string; title: string; text?: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <BadgeLine>{eyebrow}</BadgeLine>
      <h2 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">{title}</h2>
      {text && <p className="mt-4 text-base leading-7 text-foreground-2">{text}</p>}
    </div>
  );
}

function BadgeLine({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${dark ? "border-white/14 bg-white/8 text-white/72" : "border-border bg-white/65 text-accent"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-warm)]" aria-hidden />
      {children}
    </p>
  );
}

function StatusPill({ tone, children }: { tone: "success" | "warning" | "danger" | "info"; children: React.ReactNode }) {
  const styles = {
    success: "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] border-[var(--badge-success-border)] before:bg-[var(--semantic-confidence-high)]",
    warning: "bg-[var(--badge-waiting-bg)] text-[var(--badge-waiting-text)] border-[var(--badge-waiting-border)] before:bg-[var(--semantic-confidence-mid)]",
    danger: "bg-[var(--badge-danger-bg)] text-[var(--badge-danger-text)] border-[var(--badge-danger-border)] before:bg-[var(--semantic-confidence-low)]",
    info: "bg-[var(--badge-progress-bg)] text-[var(--badge-progress-text)] border-[var(--badge-progress-border)] before:bg-[var(--semantic-status-progress)]",
  }[tone];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:content-[''] ${styles}`}>
      {children}
    </span>
  );
}
