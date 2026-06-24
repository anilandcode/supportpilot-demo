# 15 — ChatGPT Landing Build Prompt

Copy and paste the prompt below into ChatGPT to generate the new SupportPilot landing page.

```text
You are a senior front-end designer and engineer. Build a complete, production-quality, responsive landing page for “SupportPilot,” a white-label enterprise AI customer-support SaaS.

OUTPUT FORMAT
- Output ONE self-contained HTML file.
- Use HTML + Tailwind CDN + small inline CSS inside <style>.
- Do not use React, build tooling, external JS frameworks, or image assets.
- Use inline SVG, CSS gradients, CSS cards, and text-based mockups for visuals.
- Include all sections in the exact order below.
- The page must work if saved as index.html and opened in a browser.
- Include accessible semantic HTML, visible focus states, aria labels where appropriate, and reduced-motion handling.
- Do not include placeholder lorem ipsum. Use the actual copy provided below.

PRODUCT CONTEXT
SupportPilot is a 24/7 white-label AI support agent. It answers from a customer’s docs using RAG, shows citations, scores confidence, and routes risky drafts to a human approval queue. Risky topics include refunds, SSO, billing, data residency, privacy, security, legal, and account deletion. The product includes an embeddable chat widget and an admin console with Overview, Tickets, Knowledge, Approvals, Analytics, and Settings.

VISUAL DIRECTION
Use “LynAI-inspired premium analytics SaaS” as the primary visual direction: warm dimensional gradient hero, large dashboard mockup, floating KPI cards, integrations strip, polished pricing, and premium SaaS motion. But keep SupportPilot’s core enterprise brand as indigo-violet, not orange. Borrow Agentra’s structure for AI agents: workflow, use cases, features, integrations, pricing, testimonials, FAQ, CTA.

DESIGN TOKENS
Use these CSS variables in :root:
--brand-primary: #6D56FF;
--brand-primary-hover: #5842E6;
--brand-primary-dark: #30247A;
--brand-primary-soft: #F4F2FF;
--brand-secondary: #F86EBC;
--brand-secondary-soft: #FFF1F8;
--brand-warm: #FFB24A;
--brand-warm-deep: #F97316;
--ink: #0F172A;
--text-secondary: #64748B;
--text-muted: #94A3B8;
--surface: #FFFFFF;
--canvas: #FCFCFD;
--subtle: #F8FAFC;
--border: #E2E8F0;
--dark: #08090D;
--success-bg: #ECFDF5;
--success-border: #A7F3D0;
--success-text: #047857;
--success-dot: #22C55E;
--warning-bg: #FFFBEB;
--warning-border: #FDE68A;
--warning-text: #92400E;
--warning-dot: #F59E0B;
--danger-bg: #FEF2F2;
--danger-border: #FECACA;
--danger-text: #B91C1C;
--danger-dot: #EF4444;
--info-bg: #EFF6FF;
--info-border: #BFDBFE;
--info-text: #1D4ED8;
--info-dot: #3B82F6;

GRADIENTS
Hero background:
radial-gradient(circle at 18% 12%, rgba(255,178,74,.45), transparent 28%),
radial-gradient(circle at 72% 8%, rgba(248,110,188,.30), transparent 32%),
radial-gradient(circle at 50% 48%, rgba(109,86,255,.38), transparent 42%),
linear-gradient(135deg, #FFF7ED 0%, #F4F2FF 42%, #EEF2FF 100%)

Dark CTA/footer background:
radial-gradient(circle at 18% 10%, rgba(109,86,255,.35), transparent 30%),
radial-gradient(circle at 82% 12%, rgba(255,178,74,.22), transparent 26%),
linear-gradient(180deg, #0B0D12 0%, #08090D 100%)

TYPOGRAPHY
- Use font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, “Segoe UI”, sans-serif.
- Use letter spacing -0.04em for hero headline, -0.025em for section titles.
- Hero headline desktop: 64-72px line-height 1.05, weight 750; mobile: 42-48px.
- Section headings: 44-52px desktop, 32-38px mobile, weight 720.
- Body: 15-18px, line-height 1.6.
- Labels/captions: 12-13px, weight 600.

LAYOUT RULES
- Max content width: 1200px.
- Use generous vertical spacing: 96px desktop between major sections, 64px mobile.
- Header height 72px, sticky top with backdrop blur.
- Cards: 20-28px border radius, 1px borders, subtle shadows.
- Buttons: 48-54px height, rounded-full or 14px radius, strong hover/focus states.
- Mockups must look like real product UI, not decorative blobs.
- All status badges must include a dot and text; never rely only on color.

MOTION
- Add subtle CSS animations: floating hero cards and soft gradient pulse.
- Disable animations under @media (prefers-reduced-motion: reduce).
- Hover cards translateY(-2px) and increase shadow.

RESPONSIVENESS
- Desktop hero: two columns, copy left, dashboard/chat visual right.
- Tablet/mobile: stack hero, dashboard mockup below copy, nav collapses into a simple “Menu” pill or hidden links with CTA visible.
- Pricing cards stack on mobile.
- Tables/mockups should not overflow; convert dense layouts to stacked cards.

ACCESSIBILITY
- Use semantic <header>, <main>, <section>, <footer>.
- Add alt text or aria-labels for visual mockups.
- Use focus-visible outlines with #6D56FF.
- Ensure text contrast is readable.
- Do not use color alone for status; include text and dot/icon.

PAGE SECTIONS AND COPY

1) HEADER
Links: Product, How it works, Security, Pricing, Docs, Login.
Primary CTA: Book demo.
Secondary small CTA: Try widget.
Logo text: SupportPilot.
Style: transparent/glass over hero, sticky top.

2) HERO
Badge: White-label AI support • Cited answers • Human approval
Headline: White-label AI support with cited answers and human approval built in.
Subhead: SupportPilot turns your help docs, policies, and workflows into a 24/7 support agent. It answers with sources, scores confidence, and routes refunds, billing, SSO, and data-residency questions to the right human before anything risky goes out.
Primary CTA: Book a 20-minute demo
Secondary CTA: Try the live widget
Trust line: Go live in 24 hours with your brand, your docs, and your escalation rules.
Hero visual: Create a large browser mockup titled “SupportPilot / Overview” with sidebar nav items Overview, Tickets, Knowledge, Approvals, Analytics, Settings. Include KPI cards: AI deflection 64%, AI acceptance 82%, Escalated 18%, Cost/conversation $0.04. Include a mini “Approval queue” card with “Refund request • Approval required • Confidence 76%.” Include a floating chat widget with messages:
User: “Can I get a refund on my annual plan?”
AI: “I found the refund policy, but this needs manager approval before I send a final answer.”
Source chips: Refund policy, Billing terms.
Badge: Approval required.

3) SOCIAL PROOF / LOGO STRIP
Headline: Built for teams that need support automation without losing control.
Subhead: Works with your help center, docs, support inbox, Slack, calendar, and billing workflows.
Use muted category pills instead of fake logos: SaaS Support, Fintech Onboarding, B2B Helpdesk, Marketplace Ops, Agencies, Enterprise IT.

4) STATS STRIP
Four cards:
24/7 — AI first response — Always-on support for common questions.
3 min — Guided setup — Add docs, tune voice, embed widget.
0 — Risky auto-sends — Approval gates for refunds, billing, SSO, privacy, and data residency.
100% — Source-visible answers — Every factual answer should show the docs it used.

5) HOW IT WORKS
Headline: From docs to live AI support in one guided workflow.
Subhead: SupportPilot keeps the setup simple for launch, then lets enterprise teams add policies, integrations, model routing, and approvals as they grow.
Four step cards with mini UI fragments:
1. Upload your knowledge — Paste FAQs, import Markdown, add help docs, and organize sources by workspace.
2. Configure brand and voice — Set your logo, colors, tone, welcome message, and domain allowlist.
3. Set approval rules — Decide which topics need review: refunds, billing, SSO, security, legal, and data residency.
4. Embed and go live — Drop in the widget script, test the live demo, and monitor tickets from the admin console.

6) USE CASES
Headline: One support agent for the questions that slow your team down.
Subhead: Start with low-risk answers, then add guarded actions and handoffs when your team is ready.
Six cards:
SaaS support deflection — Answer setup, pricing, account, and troubleshooting questions from your docs.
Billing and refund triage — Draft policy-aware responses and route refund requests for manager approval.
SSO and security onboarding — Help enterprise buyers with SAML, DPA, data residency, and access questions without guessing.
Agency white-label support — Launch a branded support widget per client workspace, with domains, roles, and policy controls.
Internal support copilot — Help human agents draft cited replies, find missing docs, and speed up ticket resolution.
Product feedback loop — Identify missing knowledge, recurring intents, and docs that need refresh.

7) AGENTIC FEATURES
Headline: Not just chat. A governed support workflow.
Subhead: The agent retrieves evidence, drafts answers, checks confidence, follows policy, and asks humans to approve risky work.
Six feature cards with mini screenshots:
Cited answers from your knowledge base — Every answer shows the source chunks behind it.
Confidence scoring — Retrieval strength, citation coverage, source freshness, and risk category inform the decision.
Approval queue — Refunds, SSO, billing, privacy, legal, and low-confidence drafts wait for manager review.
Human handoff — Escalate by email, Slack, Calendly, Zendesk, or helpdesk route.
Action-ready architecture — Start with read-only actions, then add approval-gated tool calling for tickets, refunds, CRM updates, and scheduling.
Small-model routing — Use low-cost local/small models for classification, PII, query rewrite, and easy answers; reserve stronger models for hard cases.

8) LIVE WIDGET DEMO
Headline: Try the same widget your customers will see.
Subhead: Ask about refunds, SSO setup, billing, or data residency and watch SupportPilot cite sources or ask for approval.
Create a static interactive-looking widget panel with four prompt pills:
“What is your refund policy?”
“How do I configure SSO with Okta?”
“Where is customer data hosted?”
“Can I delete all my data?”
Show a sample answer with citations accordion and escalation CTA.
Left-side state checklist: Cited answer, Confidence scored, Approval required, Human handoff ready.

9) SECURITY & TRUST
Use a dark gradient band.
Headline: Built for support teams that cannot afford hallucinated policy answers.
Subhead: SupportPilot is designed around human review, tenant isolation, audit trails, source visibility, and security controls.
Six trust cards:
RBAC and workspaces — Owners, admins, managers, agents, and viewers get role-appropriate access.
Domain allowlists — Widgets only run on verified domains with tenant-specific configuration.
Audit logs — Track source changes, approval decisions, model routes, tool calls, and policy changes.
PII-aware routing — Redact sensitive prompts and keep risky requests out of raw analytics.
SSO/SAML ready — Enterprise plan adds SAML/SSO, SCIM-ready provisioning, and access-review workflows.
Data residency path — Advanced tenants can move toward region-specific storage and provider routing.

10) INTEGRATIONS
Headline: Connect the tools your support team already uses.
Subhead: Start simple with docs, email, Slack, and Calendly; add helpdesk and workflow integrations as you scale.
Create integration tiles grouped by:
Knowledge: Docs, Markdown, Notion, Help Center, PDF/DOCX.
Handoff: Email, Slack, Calendly.
Helpdesk: Zendesk, Intercom, Gorgias, Freshdesk.
Business actions: Stripe, HubSpot, Salesforce, Linear/Jira.
Developer: Webhooks, API keys, Vercel AI SDK tools.

11) ANALYTICS / PERFORMANCE
Headline: Know what AI resolved, what humans changed, and what docs are missing.
Subhead: Track deflection, AI acceptance, escalation rate, confidence distribution, cost per conversation, and missing-knowledge clusters.
Create a dashboard mockup with metric cards and charts: deflection trend, top intents, confidence distribution, missing knowledge, model fallback rate, cost per accepted AI reply.

12) PRICING
Headline: Start with a branded support agent. Add enterprise controls when you need them.
Subhead: Every plan includes cited answers, a white-label widget, and an admin console. Higher tiers add advanced approvals, integrations, model routing, and security controls.
Three pricing cards:
Launch — $49/mo — Best for solo SaaS, small teams, first client pilots.
Features: 1 workspace; branded widget; pasted/Markdown knowledge; cited answers; basic tickets; email escalation; simple approvals; basic analytics.
CTA: Start Launch.
Pro — $149/mo — Best for growing SaaS/support teams. Highlight this card as “Most popular.”
Features: 3 workspaces; multi-source ingestion; approval policies; Slack/Calendly handoff; role-based members; advanced analytics; model route logging; domain allowlist.
CTA: Start Pro.
Enterprise — Custom from $499/mo — Best for regulated or high-volume support orgs.
Features: SSO/SAML; custom roles; audit exports; data residency options; advanced integrations; approval-gated actions; dedicated onboarding; security review package; model/provider policy.
CTA: Talk to sales.
Add callout: Need agency white-label setup? Launch multiple client workspaces with governed themes and domains.

13) TESTIMONIALS
Headline: Designed for operators who want automation without losing judgment.
Three cards:
“SupportPilot gave us fast AI replies without forcing us to auto-send billing or security answers.” — Head of Support, B2B SaaS
“The approval queue is the difference between a chatbot demo and something we can actually put in front of customers.” — Founder, SaaS agency
“Source visibility made our team trust the drafts faster.” — Support Ops Lead
Use abstract initials, not fake logos.

14) FAQ
Headline: Questions enterprise teams ask before turning on AI support.
Use an accordion-like layout, but it can be static HTML details/summary.
Questions:
How does SupportPilot avoid hallucinations?
Answer: It retrieves from your approved knowledge, cites the sources it used, checks confidence, and routes low-confidence or risky drafts for human review.
Can the widget match our brand?
Answer: Yes. Configure logo, color, bot name, greeting, radius, theme mode, position, and allowed domains per workspace.
What counts as a risky request?
Answer: Refunds, billing changes, SSO, security, privacy, legal, data residency, account deletion, and low-confidence answers should require approval by default.
Can SupportPilot take actions in other tools?
Answer: Start with safe read-only or ticket-creation actions; advanced plans can add approval-gated tool calling for helpdesk, billing, CRM, and scheduling workflows.
Does it support humans in the loop?
Answer: Yes. Drafts can be approved, edited, rejected, or escalated, and every decision should be logged for auditability.
What analytics do we get?
Answer: Track deflection, acceptance, escalation, approval edit rate, missing knowledge, source freshness, model routes, latency, and cost per accepted reply.
Can we use our own AI model or provider?
Answer: Enterprise customers should be able to configure provider and model-routing policies as the platform matures.
Is this SOC 2 compliant?
Answer: Treat SOC 2 as an enterprise-readiness roadmap: RBAC, audit logs, access reviews, retention, PII handling, incident process, and evidence exports should be implemented before making formal claims.

15) FINAL CTA
Use dark gradient.
Headline: Put an AI support agent on your site without giving up control.
Subhead: Launch with your docs and brand first. Add approvals, integrations, analytics, and enterprise controls as your support volume grows.
CTA buttons: Book a demo, Try the widget.
Include a small visual card: “Ready for review: SSO setup draft • 3 sources • Manager queue.”

16) FOOTER
Dark footer. Columns:
Product: Overview, Widget, Approvals, Knowledge, Analytics, Integrations.
Solutions: SaaS support, Agencies, Enterprise support, Internal support.
Resources: Docs, Security, Changelog, Blog, Status.
Company: About, Contact, Privacy, Terms, DPA, Subprocessors.
Bottom line: © 2026 SupportPilot. White-label AI support with cited answers and human approval.

COMPONENT DETAILS TO IMPLEMENT
- Create reusable CSS classes for .badge, .card, .glass, .btn-primary, .btn-secondary, .mock-browser, .status-dot.
- Status badge styles:
  High confidence: bg #ECFDF5, border #A7F3D0, text #047857, dot #22C55E.
  Medium confidence / waiting: bg #FFFBEB, border #FDE68A, text #92400E, dot #F59E0B.
  Approval required / escalated: bg #FEF2F2, border #FECACA, text #B91C1C, dot #EF4444.
  In progress: bg #EFF6FF, border #BFDBFE, text #1D4ED8, dot #3B82F6.
- Use inline SVG icons where useful: shield, check, file, chat, graph, lock, plug.
- Create product mockups using divs, not screenshots.
- Make the hero visually impressive: big gradient background, large mockup, floating cards, chat widget, real UI labels.

QUALITY BAR
The result should look like a premium enterprise SaaS landing page, not a generic Tailwind demo. It should clearly demonstrate SupportPilot’s unique workflow: cited answers, confidence scoring, approval queue, human handoff, white-label widget, and analytics.
```

## Source notes for the prompt

This prompt uses Google Stitch/AI-design pipeline assumptions only for the broader build workflow, not for the landing HTML generation. Google describes Stitch as a Google Labs experiment that turns prompt and image inputs into UI designs and front-end code in minutes, with chat refinement, theme selectors, and Figma paste/export workflows ([Google Developers Blog](https://developers.googleblog.com/stitch-a-new-way-to-design-uis/)).
