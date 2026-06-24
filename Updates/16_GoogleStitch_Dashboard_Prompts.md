# 16 — Google Stitch Dashboard Prompts

## How to use these prompts

Use Google Stitch for UI generation, not final production code. Google describes Stitch as a Google Labs experiment that turns simple prompt and image inputs into UI designs and front-end code in minutes, with image refinement, interactive chat, theme selectors, and Figma paste support ([Google Developers Blog](https://developers.googleblog.com/stitch-a-new-way-to-design-uis/)). Google also says Stitch can turn prompts, wireframes, or images into high-quality UI designs and corresponding frontend code for desktop and mobile, then export to CSS/HTML or Figma ([Google Blog](https://blog.google/innovation-and-ai/products/io-2025-tools-to-try-globally/)).

Recommended workflow:

1. Generate each screen separately in Stitch using the prompts below.
2. Use the same **global design-system prompt** before each screen prompt.
3. Export or copy the visual direction, then implement in Next.js with shadcn/ui, Tailwind, and the SupportPilot token system.
4. Treat Stitch output as a design reference; rebuild components with accessible Radix/shadcn primitives rather than pasting generated code blindly.

---

## Global Stitch design-system prompt

Copy this before every screen-specific prompt.

```text
Design a premium enterprise SaaS admin UI for SupportPilot, a white-label AI customer-support platform. Use a restrained, dense, evidence-first console style that matches a vivid indigo-violet marketing brand.

Product context: SupportPilot answers customer questions from company docs, cites sources, scores AI confidence, routes risky drafts to human approval, supports a white-label widget, and manages multi-tenant orgs/workspaces/domains/roles/policies/usage.

Visual style:
- Calm enterprise console, not playful chatbot UI.
- Inspired by Vercel/Linear/Stripe/shadcn: crisp typography, neutral surfaces, thin borders, compact tables, clear hierarchy, excellent spacing.
- Use vivid brand only for active states and primary CTAs.
- Use real product text and realistic data.

Design tokens:
- Font: Geist or Inter, with tabular numbers for metrics.
- Canvas: #FCFCFD.
- Surface: #FFFFFF.
- Subtle fill: #F8FAFC.
- Border: #E2E8F0.
- Text primary: #0F172A.
- Text secondary: #64748B.
- Brand primary: #6D56FF.
- Brand hover: #5842E6.
- Brand soft: #F4F2FF.
- Pink accent: #F86EBC only for tiny highlights.
- Warm accent: #FFB24A only for charts/hero previews, not buttons.

Layout system:
- Desktop app frame: left sidebar 248px, top bar 64px, content max fluid.
- Sidebar nav: Overview, Tickets, Knowledge, Approvals, Analytics, Settings, Security, Billing.
- Top bar: workspace switcher, verified domain badge, global search/command, notifications, user menu.
- Cards: 12-16px radius in console, 1px border #E2E8F0, subtle shadow only for drawers/popovers.
- Tables: sticky header, compact rows, hover states, filters, saved views, right-side actions.
- Density: enterprise high-density but readable; avoid huge empty cards.

Status and badge rules:
- Every badge includes a dot or icon plus text; do not rely on color alone.
- Ticket status New: fill #EEF2FF, border #C7D2FE, text #3730A3, dot #6366F1.
- Ticket status In progress: fill #EFF6FF, border #BFDBFE, text #1D4ED8, dot #3B82F6.
- Ticket status Waiting: fill #FFFBEB, border #FDE68A, text #92400E, dot #F59E0B.
- Ticket status Resolved: fill #ECFDF5, border #A7F3D0, text #047857, dot #22C55E.
- Ticket status Escalated: fill #FEF2F2, border #FECACA, text #B91C1C, dot #EF4444.
- Priority Low: neutral gray.
- Priority Medium: blue.
- Priority High: orange.
- Priority Critical: red.
- AI confidence High: green, 82-100%.
- AI confidence Medium: amber, 55-81%.
- AI confidence Low: red, under 55%.

Important UX rules:
- Always show sources near AI drafts.
- Always show why a draft needs approval.
- Make approvals one-click but visibly auditable.
- Show model route, confidence, and source freshness where relevant.
- White-label settings should include live widget preview and contrast warning.
- Do not make the UI dark by default; use light console with optional dark widget preview.

Output goal: high-fidelity desktop dashboard screen suitable for handoff into a Next.js + shadcn/ui + Tailwind build.
```

---

## Screen 1 — Admin Overview

```text
Create the SupportPilot Admin Overview screen using the global design system.

Screen purpose: give a support manager a daily command center for AI support performance, launch readiness, recent tickets, and approval backlog.

Layout:
- Full desktop app shell with 248px left sidebar and 64px top bar.
- Sidebar active item: Overview.
- Page header: “Overview” with subhead “Monitor AI support performance, approval risk, and workspace readiness.”
- Header actions: “Try widget”, “Add source”, “Invite member”.

Top KPI row: 4 cards in a grid.
1. AI deflection: 64%, +8% vs last week, mini sparkline.
2. AI acceptance: 82%, definition tooltip “Approved AI replies / eligible AI replies.”
3. Escalated: 18%, amber/red trend indicator.
4. Cost per conversation: $0.04, model route mix subtitle.

Workspace health / launch checklist:
- Card title: “Launch checklist” with progress 5/7 complete.
- Checklist items: Verify domain (done), Add knowledge source (done), Customize widget brand (done), Configure escalation email (done), Set approval policy (done), Invite backup approver (open), Test live widget (open).
- Include “Go live readiness: Good” badge.

Main content grid:
- Left large card: “Support volume” line/bar chart for last 14 days with AI answered, human escalated, approval required.
- Right card: “Approval queue” with 4 compact review rows: refund, SSO, billing email, data residency. Each row shows risk badge, confidence, SLA timer, reviewer.

Bottom grid:
- Recent tickets table with columns: Ticket, Customer, Intent, Status, Priority, Confidence, Last activity.
- Missing knowledge card with top gaps: “Okta SSO metadata”, “Refund exception policy”, “EU data residency”, each with Add doc CTA.

Visual details:
- Use crisp cards, subtle borders, compact typography.
- Include a small floating widget preview in bottom right showing a cited answer.
- Use realistic data but no fake real company logos.
```

---

## Screen 2 — Tickets list + ticket detail drawer

```text
Create the SupportPilot Tickets screen with a table-first inbox and an open ticket detail drawer.

Layout:
- App shell with sidebar active item: Tickets.
- Page header: “Tickets” with subhead “Review conversations, AI drafts, confidence, and escalations.”
- Header actions: “Export”, “Create ticket”, “Saved views”.

Top controls:
- Search input: “Search tickets, customers, source IDs...”
- Saved view tabs: All, Needs approval, Low confidence, Billing disputes, Unassigned, Escalated.
- Filters: Status, Priority, Risk, Assignee, Confidence, Source freshness, Date.

Tickets table:
Columns: ID, Customer, Subject, Intent, Status, Priority, AI confidence, Sources, Assignee, SLA, Last activity.
Rows should include realistic examples:
- T-1042, Maya Chen, “Refund annual plan”, Billing/refund, Waiting, High, 76%, 2 sources, Nora, 1h 12m.
- T-1041, Bilal Khan, “Okta SSO setup”, SSO/security, Escalated, Critical, 61%, 3 sources, Aisha, 28m.
- T-1040, Hana Lee, “Widget install on Webflow”, Setup, In progress, Medium, 91%, 4 sources, AI, 3m.
- T-1039, Omar Ali, “Data residency for EU users”, Security, Waiting, High, 68%, 2 sources, Manager queue, 42m.

Open detail drawer on the right:
- Drawer width around 520px.
- Header: ticket ID, subject, status, priority, customer, last activity.
- Timeline tab: customer messages, AI draft, internal note, approval event.
- AI draft panel with confidence meter 76%, risk reason “Refund request requires manager approval.”
- Sources panel with citation cards: Refund policy v3, Billing terms, Cancellation FAQ. Include excerpts and freshness labels.
- Policy panel: matched policy “Refunds over $0 require manager approval.”
- Sticky footer actions: Approve draft, Edit reply, Reject, Escalate.

Design density:
- Compact table rows, right drawer highly readable.
- Sources should be visually adjacent to AI draft.
- The drawer should show audit metadata: model route Gemini Flash, retrieval topK 5, created 12:42 PM.
```

---

## Screen 3 — Knowledge sources + ingestion status

```text
Create the SupportPilot Knowledge screen for managing RAG sources, ingestion, freshness, and missing docs.

Layout:
- Sidebar active item: Knowledge.
- Page header: “Knowledge” with subhead “Keep AI answers grounded in approved, fresh sources.”
- Header actions: “Upload files”, “Add URL/source”, “Reindex all”.

Top summary cards:
1. Sources: 38 active.
2. Chunks indexed: 12,480.
3. Freshness score: 86%.
4. Missing knowledge: 7 clusters.

Primary layout:
- Left: source table.
- Right: selected source detail panel.

Source table columns:
Source, Type, Status, Last indexed, Freshness, Chunks, Answers using it, Issues, Actions.
Rows:
- Refund policy, Markdown, Synced, Today 10:12, Fresh, 128, 342, none.
- SSO setup guide, Notion, Syncing, 2 min ago, Fresh, 312, 184, none.
- EU data residency FAQ, PDF, Needs review, 14 days ago, Stale, 84, 76, stale policy.
- Billing terms, URL import, Failed, Yesterday, Unknown, 0, 0, 403 blocked.

Selected source detail panel:
- Title: Refund policy.
- Source version: v3.4.
- Trust level: Approved.
- Freshness: Fresh.
- Embedding model: Qwen3-Embedding-0.6B planned / Gemini current route.
- Chunk preview list with snippets and citation IDs.
- Buttons: Reindex, View citations, Mark stale, Archive.

Missing knowledge card:
- Cluster examples: “Okta SSO metadata,” “refund exceptions,” “data deletion SLA.”
- Each cluster has count, last ticket, suggested article title, CTA “Create source.”

Upload/import area:
- Drag and drop panel: Markdown, TXT, PDF/DOCX, Notion, URL/help center.
- Ingestion pipeline mini-steps: Extract → Chunk → Embed → Index → Eval.

Visual rules:
- Use source status badges: Synced green, Syncing blue, Needs review amber, Failed red.
- Show freshness as progress rings or bars.
- Do not make this look like a generic file manager; emphasize RAG answer quality.
```

---

## Screen 4 — Approvals queue

```text
Create the SupportPilot Approvals screen for reviewing risky AI drafts.

Layout:
- Sidebar active item: Approvals.
- Page header: “Approvals” with subhead “Review AI drafts before risky replies or actions reach customers.”
- Header actions: “Policy settings”, “Assign reviewer”, “Batch approve safe”.

Top summary strip:
- Pending approvals: 12.
- SLA at risk: 3.
- Average edit rate: 24%.
- Auto-send blocked: 31 this week.

Filters/tabs:
- All, Refunds, Billing, SSO/Security, Data residency, Low confidence, Tool actions.
- Filter chips for Risk, Confidence, Reviewer, SLA.

Main layout:
- Left column: queue cards grouped by risk and SLA.
- Right column: selected approval review workspace.

Queue card content:
- Customer, ticket ID, request summary.
- Risk category badge: Refund / SSO / Data residency.
- Confidence badge and meter.
- Policy reason text.
- SLA timer.

Selected review workspace:
- Header: “Refund annual plan — T-1042.”
- Risk reason: “Refund request requires manager approval. Retrieval confidence medium-high but policy prevents auto-send.”
- Confidence meter: 76%, amber.
- AI draft text in a clean editor card.
- Sources beside the draft: Refund policy v3, Billing terms, Cancellation FAQ with excerpts and citation IDs.
- Policy card: matched rule, approver role, threshold, allowed actions.
- Audit trail: draft generated, policy evaluated, assigned to Nora, source versions.
- Action buttons: Approve and send, Edit draft, Reject draft, Escalate to human, Add internal note.

Important design rules:
- Approval decision buttons should be sticky at bottom of selected workspace.
- Show a diff-like edited reply preview if “Edit draft” state is visible.
- Approval cards must feel safe and auditable, not like a casual inbox.
```

---

## Screen 5 — Analytics

```text
Create the SupportPilot Analytics screen for AI support performance, RAG quality, approvals, and model cost.

Layout:
- Sidebar active item: Analytics.
- Page header: “Analytics” with subhead “Measure deflection, answer quality, human review, and model cost.”
- Header controls: date range, workspace, channel, export CSV.

Top KPI row:
- Deflection rate: 64%.
- AI acceptance: 82%.
- Escalation rate: 18%.
- Cost per accepted AI reply: $0.05.
- Median first response: 1.8s.

Charts:
1. Resolution funnel: Conversations → AI eligible → AI answered → Approved → Resolved.
2. Trend chart: Deflection, approvals, escalations over time.
3. Confidence distribution: High, medium, low.
4. Top intents bar chart: Setup, billing, SSO, refunds, data residency, bug reports.
5. Missing knowledge clusters table: topic, ticket count, estimated deflection lift, recommended source.
6. Model routing table: route, model/provider, volume, latency, estimated cost, fallback rate.

Quality panel:
- Citation missing rate: 2.7%.
- Source stale rate: 8%.
- Approval edit rate: 24%.
- Human override reasons: policy gap, missing source, tone, wrong procedure.

Design rules:
- Use restrained charts with indigo, blue, green, amber, red semantics.
- Pair each chart with an operational CTA: Add source, Tune policy, Review low confidence, Reduce fallback.
- Avoid rainbow dashboards and decorative charts without action.
```

---

## Screen 6 — Settings hub

```text
Create the SupportPilot Settings screen as a structured enterprise settings hub.

Layout:
- Sidebar active item: Settings.
- Page header: “Settings” with subhead “Configure branding, policies, members, domains, escalation, billing, and security.”
- Use a two-column layout: left settings navigation, right selected settings panel.

Settings navigation groups:
Workspace, Widget & Branding, Brand Voice, Approval Policies, Escalation, Members & Roles, Domains, Integrations, Security, Billing.

Selected panel: Widget & Branding.
Fields/components:
- Workspace name: Acme Support.
- Bot name: Acme AI Support.
- Logo upload area.
- Primary color picker default #6D56FF.
- Radius selector: Soft, Rounded, Pill.
- Theme mode: Light, Dark, System.
- Widget position: Bottom right, Bottom left.
- Welcome message text area.
- Privacy footer text area.
- Domain allowlist with verified/unverified states.
- Contrast validation alert: “Primary color passes AA on white text.”
- Live widget preview card on the right.

Approval Policies preview section:
- Toggle rows for Refunds, Billing changes, SSO/Security, Data residency, Account deletion, Low confidence.
- Each row has min confidence threshold, approver role, and enabled switch.

Members & Roles preview section:
- Roles: Owner, Admin, Manager, Agent, Viewer.
- Invite member button and role badge.

Billing preview section:
- Plan card: Pro, usage meter, Stripe portal button, next invoice.

Design rules:
- Make forms Stripe-like: grouped sections, labels, helper text, validation, sticky save bar.
- Use destructive states only for dangerous settings like deleting workspace or disabling domain verification.
```

---

## Screen 7 — Security page

```text
Create the SupportPilot Security screen for enterprise controls.

Layout:
- Sidebar active item: Security.
- Page header: “Security” with subhead “Manage access, auditability, retention, SSO, and AI safety controls.”
- Header actions: “Export audit log”, “Security checklist”, “Contact enterprise”.

Cards and sections:
1. Security readiness score card: 72%, with checklist items: RLS tests, audit logs, SSO, retention policy, DPA, access review.
2. SSO/SAML card: status “Not configured”, button “Configure SSO”, IdP placeholder Okta/Google/Azure AD.
3. Audit log table: timestamp, actor, event, target, IP, result. Events include approval policy changed, source reindexed, draft approved, API key rotated, domain verified.
4. API keys card: active keys, scopes, last used, rotate/revoke actions.
5. Data retention card: conversation retention, log retention, PII redaction toggle, deletion workflow.
6. AI safety controls: prompt injection detection, grounding required, citation required, tool action approval required, high-risk categories.
7. Data residency card: region policy, provider restrictions, enterprise-only badge.

Design rules:
- This page should feel procurement-ready and sober.
- Use compact tables and clear empty states.
- Do not overuse gradients; one small brand accent is enough.
```

---

## Screen 8 — Billing page

```text
Create the SupportPilot Billing screen for plan, usage, invoices, and plan limits.

Layout:
- Sidebar active item: Billing.
- Page header: “Billing” with subhead “Manage plan, usage, invoices, and model-cost visibility.”
- Header actions: “Open Stripe portal”, “Upgrade”, “Contact sales”.

Top plan card:
- Current plan: Pro.
- Price: $149/mo.
- Renewal date.
- Included usage: conversations, workspaces, members, sources.
- Plan health badge: “Within limits.”

Usage cards:
- Conversations this month: 4,820 / 10,000.
- AI replies: 3,920.
- Approval reviews: 312.
- Model fallback calls: 428.
- Storage / indexed chunks.

Model cost table:
Columns: route, model/provider, volume, avg latency, estimated cost, fallback reason.
Rows: local classifier, Gemini Flash-Lite, Gemini Flash, premium fallback.

Invoices table:
Date, invoice ID, amount, status, download.

Upgrade comparison strip:
- Launch: $49/mo.
- Pro: current.
- Enterprise: custom from $499/mo with SSO, audit exports, data residency, advanced integrations.

Design rules:
- Billing should feel trustworthy and clear.
- Use Stripe-like form/card discipline, subtle borders, and no gimmicks.
```

---

## Screen 9 — Embeddable chat widget

```text
Create a high-fidelity SupportPilot embeddable chat widget design with launcher, open messenger, citations, confidence, and escalation states.

Context: This widget is embedded on a customer website and can be white-labeled per workspace.

Design tokens:
- Default brand primary #6D56FF, but make it clear tenant colors can override launcher and primary CTA.
- Widget desktop width 400px, max height 680px, radius 24px, shadow 0 20px 60px rgba(15,23,42,.18).
- Mobile should become full-screen with 0-16px radius.

Show two states side by side:
1. Closed launcher:
- 56px circular/rounded-square launcher at bottom right.
- SupportPilot/tenant icon, unread dot, accessible label “Open support chat.”

2. Open messenger:
- Header with tenant logo, bot name “Acme AI Support,” online indicator, disclosure “AI answers from Acme docs,” close/minimize icon.
- Conversation messages:
  User: “How do I set up SSO with Okta?”
  AI: “I found the Okta SSO setup guide. This draft needs review because SSO is marked as a security-sensitive topic.”
- AI message includes source chips: Okta SSO guide, SAML checklist, Security FAQ.
- Citations accordion expanded with source title, excerpt, version/freshness, URL placeholder.
- Confidence card: 68%, Medium, “Security topic — approval required.”
- Escalation CTA: “Send to support engineer” and “Book setup call.”
- Composer: “Ask another question...” with send button.
- Privacy footer: “Answers use Acme docs; sensitive requests may be reviewed by humans.”

Additional mini states within the same design:
- High-confidence cited answer state: green confidence 91%, “Answered from 3 sources.”
- Low-confidence state: red confidence 42%, “I’m not confident enough to answer. Create a ticket?”
- Human handoff state: “A support engineer has been notified in Slack.”

Design rules:
- The widget should feel friendly but enterprise-safe.
- Citations must be easy to open, not hidden in tiny text.
- Approval pending must be transparent to the user.
- Do not imply a human has reviewed a draft until approved.
```

---

## Next.js + shadcn/Tailwind handoff guidance

- Rebuild Stitch screens with shared app-shell primitives: `Sidebar`, `Topbar`, `PageHeader`, `KpiCard`, `DataTable`, `StatusBadge`, `ConfidenceMeter`, `SourceCard`, `ApprovalCard`, `TicketDrawer`, `WidgetPreview`.
- Use shadcn/ui for buttons, dialogs, dropdowns, tabs, sheets, forms, tables, tooltips, and accordions; shadcn/ui provides editable component code rather than a locked package ([shadcn/ui docs](https://ui.shadcn.com/docs)).
- Use Radix primitives for focus management and keyboard-accessible interactions such as dialogs, menus, popovers, and tabs ([Radix accessibility docs](https://www.radix-ui.com/primitives/docs/overview/accessibility)).
- Keep all colors as CSS variables so tenant white-label themes can override widget brand color without changing semantic status colors.
- Implement every badge through a single `StatusBadge` component that maps state to the token table above.
- Create a `DESIGN.md` in the repository and paste the global design-system prompt plus token rules into it before using AI coding agents.
