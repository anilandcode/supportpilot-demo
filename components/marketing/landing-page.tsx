"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileText,
  LifeBuoy,
  LockKeyhole,
  MessageSquare,
  Search,
  ShieldCheck,
} from "lucide-react";
import { theme } from "@/lib/theme";

const storyRows = [
  {
    number: "1",
    title: "Answers backed by evidence.",
    text: "Every response is grounded in approved sources, with citations, freshness checks, and clear signals when knowledge is missing.",
    link: "Explore cited answers",
    href: "#support-flow",
    visual: "evidence",
  },
  {
    number: "2",
    title: "Automation with an approval layer.",
    text: "High-risk or sensitive requests route to human review with context, policy references, and confidence already attached.",
    link: "See the approval queue",
    href: "#support-flow",
    visual: "approval",
  },
  {
    number: "3",
    title: "Insights that improve support over time.",
    text: "Track accepted answers, escalations, and missing-knowledge patterns, then use that signal to keep support improving.",
    link: "Explore support insights",
    href: "#analytics",
    visual: "insights",
  },
] as const;

const integrations = ["Notion", "Google Docs", "Confluence", "Slack", "Zendesk", "Intercom", "HubSpot", "Stripe", "Salesforce", "Linear"];

const flowTabs = [
  {
    id: "assist",
    label: "Smart Assist",
    title: "Retrieve answers from approved knowledge with citations.",
    copy: "SupportPilot looks for evidence before it drafts, then keeps the source path visible for review.",
    metric: "92%",
    metricLabel: "best source match",
  },
  {
    id: "review",
    label: "Review Queue",
    title: "Score the answer before it reaches the customer.",
    copy: "Retrieval quality, policy sensitivity, and intent match decide whether the draft can be sent or needs review.",
    metric: "3",
    metricLabel: "risk checks",
  },
  {
    id: "handoff",
    label: "Human Handoff",
    title: "Hand off the full context, not just the conversation.",
    copy: "Escalations include the customer message, draft, citations, risk reason, and recommended owner.",
    metric: "4m",
    metricLabel: "review-ready packet",
  },
  {
    id: "knowledge",
    label: "Knowledge Health",
    title: "Spot missing topics before customers repeat them.",
    copy: "Low-confidence answers and negative feedback become suggested knowledge tasks for the team.",
    metric: "10",
    metricLabel: "approved sources",
  },
  {
    id: "routing",
    label: "Policy Routing",
    title: "Keep sensitive answers inside policy.",
    copy: "Refund, billing, SSO, legal, privacy, and account requests can require the right role before finalization.",
    metric: "0",
    metricLabel: "risky auto-sends",
  },
] as const;

const enterpriseCards = [
  ["Role-based access", "Granular permissions for agents, managers, administrators, analysts, and viewers.", "SSO / SCIM ready"],
  ["Domain allowlists", "Only approved customer origins can load workspace widget configuration.", "Data stays in control"],
  ["Audit logs", "Track source changes, AI runs, approval decisions, and policy changes.", "Audit-ready"],
  ["PII-aware routing", "Detect and redact sensitive prompts before AI, analytics, and audit logging.", "Privacy by design"],
  ["Enterprise roadmap", "Formal controls, retention jobs, and evidence packets stay visible as production hardening.", "Controls underway"],
  ["Deployment choices", "Plan provider routing, data handling, and regional processing for larger teams.", "Configurable path"],
] as const;

const pricing = [
  {
    name: "Launch",
    price: "$49/mo",
    text: "For first pilots and single-workspace support teams.",
    featured: false,
    features: ["1 workspace", "Branded widget", "Cited answers", "Basic approvals", "Usage limits"],
  },
  {
    name: "Pro",
    price: "$149/mo",
    text: "For growing teams that need richer review and source operations.",
    featured: true,
    features: ["3 workspaces", "Approval policies", "Model route logs", "Slack/Calendly handoff", "Advanced analytics"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    text: "For regulated support teams with custom controls.",
    featured: false,
    features: ["SSO/SAML path", "Audit exports", "Data residency options", "Custom roles", "Dedicated onboarding"],
  },
] as const;

const faqs = [
  ["How does SupportPilot avoid hallucinations?", "It retrieves from approved knowledge, cites the sources it used, checks confidence, and routes low-confidence or risky drafts to human review."],
  ["Can the widget match our brand?", "Yes. Configure bot name, colors, welcome copy, launcher position, privacy text, and verified domains per workspace."],
  ["Where is our support data stored?", "The demo is Supabase-backed when environment variables are configured, with tenant-scoped rows and RLS. Enterprise deployment choices remain part of onboarding."],
  ["Can we integrate with existing tools?", "SupportPilot is designed to sit beside docs, helpdesks, communication tools, CRM, and billing systems. Write actions remain approval-gated future work."],
  ["Do we need developers to get started?", "The first setup can be guided through sources, policies, domains, and widget snippets. Developers are only needed for deeper custom integrations."],
  ["What happens when AI is not confident?", "It can ask a clarifying question, create a source-gap task, route to approvals, or escalate the context to a human owner."],
] as const;

const testimonials = [
  {
    quote: "SupportPilot turned our support workflow into something our team can actually trust: faster answers for customers, clear oversight for operators.",
    name: "Daniel Cruz",
    role: "Customer experience lead, Acme Co.",
  },
  {
    quote: "The approval queue is the difference between a chatbot demo and something we can put in front of customers.",
    name: "Aisha Quinn",
    role: "Founder, SaaS agency",
  },
  {
    quote: "Source visibility made our team review drafts faster because every answer showed what it was based on.",
    name: "Sam Vega",
    role: "Support operations lead",
  },
] as const;

const useCaseLinks: ReadonlyArray<readonly [string, LucideIcon]> = [
  ["SaaS support deflection", MessageSquare],
  ["Billing and refund triage", CreditCard],
  ["SSO and security onboarding", LockKeyhole],
  ["Agency white-label support", Building2],
  ["Internal support copilot", LifeBuoy],
];

export function MarketingLandingPage() {
  const [activeFlow, setActiveFlow] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const flow = flowTabs[activeFlow];
  const testimonial = testimonials[testimonialIndex];

  function focusFlowTab(index: number) {
    const next = (index + flowTabs.length) % flowTabs.length;
    setActiveFlow(next);
    tabRefs.current[next]?.focus();
  }

  function onFlowKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusFlowTab(index + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusFlowTab(index - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      focusFlowTab(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      focusFlowTab(flowTabs.length - 1);
    }
  }

  function moveTestimonial(delta: number) {
    setTestimonialIndex((current) => (current + delta + testimonials.length) % testimonials.length);
  }

  return (
    <main className="marketing-page" id="top">
      <section className="marketing-hero" aria-labelledby="hero-title">
        <div className="marketing-shell">
          <div className="marketing-hero-copy">
            <Eyebrow>White-label AI support</Eyebrow>
            <h1 id="hero-title">
              AI support with <span>evidence,</span> approvals, and a human fallback.
            </h1>
            <p>
              Turn trusted docs and support workflows into a branded AI agent that cites answers, flags risk, and brings in your team at the right moment.
            </p>
            <div className="marketing-actions">
              <a className="marketing-button marketing-button-primary" href={theme.escalation.url} target="_blank" rel="noopener noreferrer">
                Book a demo <Calendar className="h-4 w-4" aria-hidden />
              </a>
              <a className="marketing-button marketing-button-outline" href="#support-flow">
                See how it works <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
          <HeroConsole />
          <div className="marketing-trust-strip" aria-label="SupportPilot trust signals">
            {["Cited answers", "Approval gates", "Audit logs", "Verified domains"].map((item) => (
              <span key={item}><CheckCircle2 className="h-4 w-4" aria-hidden />{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-section" id="product" aria-labelledby="story-title">
        <div className="marketing-shell">
          <SectionHeader eyebrow="One agent. More control." title="Support that stays useful, even when the question gets complex." text="SupportPilot combines trusted retrieval, sensible safeguards, and practical team visibility in a single support workflow." />
          <div className="marketing-story-list">
            {storyRows.map((story, index) => (
              <article key={story.title} className={`marketing-story-row ${index === 1 ? "is-reverse" : ""}`}>
                <div className="marketing-story-copy">
                  <span className="marketing-story-number">{story.number}</span>
                  <h3>{story.title}</h3>
                  <p>{story.text}</p>
                  <a href={story.href}>{story.link} <ArrowRight className="h-4 w-4" aria-hidden /></a>
                </div>
                <StoryVisual type={story.visual} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-integrations" id="integrations" aria-labelledby="integrations-title">
        <div className="marketing-shell marketing-framed">
          <div className="marketing-stripe-band" aria-hidden />
          <div className="marketing-integrations-intro">
            <span className="marketing-kicker">Connected support stack</span>
            <h2 id="integrations-title">Connect the tools your support team already uses.</h2>
            <p>Start with docs, email, Slack, Calendly, and helpdesk workflows, then add guarded business actions as the team matures.</p>
          </div>
          <div className="marketing-rail-window" aria-label="Supported integrations">
            <div className="marketing-rail-track">
              {[...integrations, ...integrations].map((item, index) => (
                <div className="marketing-integration-cell" key={`${item}-${index}`}>
                  <span>{item.slice(0, 2)}</span>
                  <b>{item}</b>
                </div>
              ))}
            </div>
          </div>
          <a className="marketing-integration-cta" href="#demo">Talk through your stack <ArrowRight className="h-4 w-4" aria-hidden /></a>
        </div>
      </section>

      <section className="marketing-flow" id="support-flow" aria-labelledby="flow-title">
        <div className="marketing-shell marketing-framed">
          <div className="marketing-flow-tabs" role="tablist" aria-label="SupportPilot operating modes">
            {flowTabs.map((tab, index) => (
              <button
                key={tab.id}
                ref={(node) => { tabRefs.current[index] = node; }}
                id={`flow-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={activeFlow === index}
                aria-controls={`flow-panel-${tab.id}`}
                tabIndex={activeFlow === index ? 0 : -1}
                onKeyDown={(event) => onFlowKeyDown(event, index)}
                onClick={() => setActiveFlow(index)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="marketing-flow-surface">
            <div
              className="marketing-flow-board"
              id={`flow-panel-${flow.id}`}
              role="tabpanel"
              aria-labelledby={`flow-tab-${flow.id}`}
            >
              <div className="marketing-flow-top">
                <div>
                  <p>SupportPilot response flow</p>
                  <h2 id="flow-title">{flow.title}</h2>
                </div>
                <span>{flow.metric}<small>{flow.metricLabel}</small></span>
              </div>
              <div className="marketing-flow-grid">
                <div className="marketing-answer-preview">
                  <div className="marketing-search"><Search className="h-4 w-4" aria-hidden /> Search approved knowledge...</div>
                  <p>Yes, annual plans are eligible for a refund within 30 days when usage remains inside the policy limit.</p>
                  <div className="marketing-source-chips">
                    <span>Refund Policy 92%</span>
                    <span>Subscription Terms 86%</span>
                    <span>Usage Limits 78%</span>
                  </div>
                </div>
                <div className="marketing-review-card">
                  <h3>{flow.label}</h3>
                  <p>{flow.copy}</p>
                  <div className="marketing-meter"><i style={{ width: activeFlow === 1 ? "83%" : activeFlow === 4 ? "72%" : "92%" }} /></div>
                  <span>{activeFlow === 1 || activeFlow === 4 ? "Manager review path" : "Ready with citations"}</span>
                </div>
              </div>
              <div className="marketing-flow-metrics">
                {["3 sources", "92% match", "Fresh this week", "Audit logged"].map((item) => <span key={item}>{item}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-enterprise" id="security" aria-labelledby="security-title">
        <div className="marketing-shell">
          <div className="marketing-enterprise-grid">
            <div className="marketing-enterprise-copy">
              <Eyebrow dark>Built for enterprise support</Eyebrow>
              <h2 id="security-title">Controls for teams that cannot afford guesswork.</h2>
              <p>Security, privacy, and governance live inside the support workflow so automation does not become unmanaged risk.</p>
              <a href="#docs">View security overview <ArrowRight className="h-4 w-4" aria-hidden /></a>
            </div>
            <div className="marketing-enterprise-cards">
              {enterpriseCards.map(([title, text, label]) => (
                <article key={title}>
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <span>{label}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section" id="analytics" aria-labelledby="analytics-title">
        <div className="marketing-shell">
          <SectionHeader eyebrow="Actionable support intelligence" title="Know what AI resolved, what humans changed, and what customers still ask." text="See knowledge gaps, accepted answers, escalations, and manual work that can be improved." />
          <AnalyticsBoard />
        </div>
      </section>

      <SignalMarquee />

      <section className="marketing-pricing" id="pricing" aria-labelledby="pricing-title">
        <div className="marketing-shell">
          <div className="marketing-pricing-top">
            <SectionHeader eyebrow="Simple pricing" title="Start with support you can trust." text="Every plan includes cited answers, a white-label widget, and a governed operating model." align="left" />
            <span>Monthly billing</span>
          </div>
          <div className="marketing-pricing-grid">
            {pricing.map((plan) => (
              <article key={plan.name} className={plan.featured ? "is-featured" : ""}>
                {plan.featured ? <span className="marketing-plan-badge">Popular</span> : null}
                <h3>{plan.name}</h3>
                <strong>{plan.price}</strong>
                <p>{plan.text}</p>
                <a href={plan.name === "Enterprise" ? theme.escalation.url : "#demo"}>{plan.name === "Enterprise" ? "Talk to sales" : "Start with demo"}</a>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}><CheckCircle2 className="h-4 w-4" aria-hidden />{feature}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-proof" id="solutions" aria-labelledby="solutions-title">
        <div className="marketing-shell">
          <div className="marketing-proof-grid">
            <div className="marketing-use-case-panel">
              <Eyebrow>Use cases</Eyebrow>
              <h2 id="solutions-title">Built for the work behind great answers.</h2>
              <p>Launch a branded support experience for SaaS teams, agencies, internal support, and enterprise onboarding.</p>
              {useCaseLinks.map(([label, Icon]) => (
                <div className="marketing-use-case" key={String(label)}>
                  <span><Icon className="h-4 w-4" aria-hidden />{label}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </div>
              ))}
            </div>
            <div className="marketing-testimonial" aria-label="Customer testimonial carousel">
              <div className="marketing-testimonial-top">
                <span>Loved by support teams</span>
                <span>{testimonialIndex + 1} / {testimonials.length}</span>
              </div>
              <blockquote>"{testimonial.quote}"</blockquote>
              <div className="marketing-person-row">
                <span aria-hidden>{testimonial.name.slice(0, 2).toUpperCase()}</span>
                <div>
                  <b>{testimonial.name}</b>
                  <small>{testimonial.role}</small>
                </div>
              </div>
              <div className="marketing-quote-controls">
                <button type="button" onClick={() => moveTestimonial(-1)} aria-label="Previous testimonial"><ArrowLeft className="h-4 w-4" aria-hidden /></button>
                <button type="button" onClick={() => moveTestimonial(1)} aria-label="Next testimonial"><ArrowRight className="h-4 w-4" aria-hidden /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-faq" id="docs" aria-labelledby="faq-title">
        <div className="marketing-shell">
          <SectionHeader eyebrow="Frequently asked questions" title="Questions enterprise teams ask before turning on AI support." text="The trust model, rollout path, and operating controls in one place." />
          <div className="marketing-faq-grid">
            {faqs.map(([question, answer], index) => (
              <article key={question} className={openFaq === index ? "is-open" : ""}>
                <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                  <span>{question}</span>
                  <span aria-hidden>+</span>
                </button>
                <div className="marketing-faq-answer"><p>{answer}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-conversion" id="demo" aria-labelledby="demo-title">
        <div className="marketing-shell marketing-conversion-grid">
          <div>
            <Eyebrow>Ready to get started?</Eyebrow>
            <h2 id="demo-title">Put a governed AI support agent on your site.</h2>
            <p>Launch a branded support experience that gives customers instant answers while keeping your team in control of every important decision.</p>
            <a className="marketing-button marketing-button-dark" href={theme.escalation.url} target="_blank" rel="noopener noreferrer">
              Book a demo <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
          <FinalWidget />
        </div>
      </section>
    </main>
  );
}

function HeroConsole() {
  return (
    <div className="marketing-hero-stage" aria-label="SupportPilot product interface preview">
      <div className="marketing-product-tabs" aria-hidden>
        {["Overview", "Sources", "Approvals", "Analytics", "Settings"].map((tab, index) => <span className={index === 0 ? "active" : ""} key={tab}>{tab}</span>)}
      </div>
      <div className="marketing-console">
        <aside>
          <b>SupportPilot</b>
          {["Overview", "Tickets", "Knowledge", "Approvals", "Analytics"].map((item, index) => (
            <span className={index === 0 ? "active" : ""} key={item}>{item}</span>
          ))}
        </aside>
        <section aria-label="Cited answer conversation">
          <div className="marketing-console-top">
            <h2>Refund request #1842</h2>
            <span>Review ready</span>
          </div>
          <div className="marketing-message is-user">Can I get a refund on my annual plan?</div>
          <div className="marketing-message is-ai">
            <b>Pilot draft <small>AI</small></b>
            <p>Annual plans are eligible for a refund within 30 days when usage remains inside the policy limit.</p>
            <div>
              <span>Refund Policy</span>
              <span>Subscription Terms</span>
              <span>API Usage Limits</span>
            </div>
          </div>
          <div className="marketing-composer">Ask about a policy, setup, or billing question <ArrowRight className="h-4 w-4" aria-hidden /></div>
        </section>
        <aside>
          <b>Confidence</b>
          <strong>92%</strong>
          <div className="marketing-meter"><i style={{ width: "92%" }} /></div>
          <dl>
            <div><dt>Source freshness</dt><dd>Current</dd></div>
            <div><dt>Policy risk</dt><dd>Review required</dd></div>
            <div><dt>Next step</dt><dd>Manager approval</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

function StoryVisual({ type }: { type: typeof storyRows[number]["visual"] }) {
  if (type === "approval") {
    return (
      <div className="marketing-story-visual visual-approval">
        <div className="marketing-queue-card">
          <b>Approval queue</b>
          {["Refund exception", "Permission change", "Custom contract"].map((item, index) => (
            <span key={item}><i />{item}<em>{index === 0 ? "High" : index === 1 ? "Medium" : "Low"}</em></span>
          ))}
        </div>
      </div>
    );
  }
  if (type === "insights") {
    return (
      <div className="marketing-story-visual visual-insights">
        <div className="marketing-insight-card">
          <b>AI performance</b>
          <MiniLineChart />
          <div><span>62%<small>Deflection</small></span><span>81%<small>Acceptance</small></span><span>14%<small>Escalation</small></span></div>
        </div>
      </div>
    );
  }
  return (
    <div className="marketing-story-visual visual-evidence">
      <div className="marketing-doc-card">
        <b>Used 3 sources</b>
        {["Refund Policy", "Subscription Terms", "API Usage Limits"].map((source) => <span key={source}><FileText className="h-4 w-4" aria-hidden />{source}<small>Fresh</small></span>)}
        <p><CheckCircle2 className="h-4 w-4" aria-hidden />All sources are approved</p>
      </div>
    </div>
  );
}

function AnalyticsBoard() {
  return (
    <div className="marketing-analytics-board" aria-label="Support intelligence dashboard demo">
      <div className="marketing-analytics-top"><b>Support intelligence</b><span>Demo workspace - Last 30 days</span></div>
      <div className="marketing-analytics-main">
        <div>
          <b>Knowledge coverage and accepted answers</b>
          <div className="marketing-matrix">
            {[42, 66, 58, 78, 71, 88, 82].map((height, index) => <i key={`${height}-${index}`} style={{ height: `${height}%` }} />)}
          </div>
        </div>
        <aside>
          <b>Top missing topics</b>
          {["Refund exceptions", "API rate limits", "SSO setup", "Contract changes"].map((topic) => <span key={topic}>{topic}<small>{Math.floor(126 - topic.length * 4)} searches</small></span>)}
        </aside>
      </div>
      <div className="marketing-analytics-stats">
        {["62% AI deflection", "81% human acceptance", "14% escalation rate", "40h time returned"].map((stat) => <span key={stat}>{stat}</span>)}
      </div>
    </div>
  );
}

function FinalWidget() {
  return (
    <div className="marketing-widget-demo" aria-label="Branded SupportPilot widget preview">
      <div className="marketing-widget-top"><b>Acme AI Support</b><span>Online</span></div>
      <div className="marketing-widget-body">
        <p className="is-question">How do I configure SSO with Okta?</p>
        <p className="is-answer">SSO setup is security-sensitive. I found the Okta guide and routed the draft to a support engineer.</p>
        <span>Okta SSO guide v3.4</span>
        <div>Ask another question <ArrowRight className="h-4 w-4" aria-hidden /></div>
      </div>
    </div>
  );
}

function MiniLineChart() {
  return (
    <svg viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden>
      <path d="M0 82 L22 70 L43 74 L65 58 L87 61 L109 49 L132 55 L155 34 L177 39 L201 24 L224 31 L248 14 L272 20 L300 7" />
      <path d="M0 90 L22 87 L43 80 L65 82 L87 73 L109 77 L132 63 L155 68 L177 55 L201 61 L224 42 L248 47 L272 35 L300 29" />
    </svg>
  );
}

function SignalMarquee() {
  return (
    <section className="marketing-signal" aria-label="Decorative moving line pattern">
      <div className="marketing-shell">
        <div><span /><span /></div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, text, align = "center" }: { eyebrow: string; title: string; text?: string; align?: "center" | "left" }) {
  return (
    <div className={`marketing-section-heading ${align === "left" ? "is-left" : ""}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}

function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <span className={`marketing-eyebrow ${dark ? "is-dark" : ""}`}>{children}</span>;
}
