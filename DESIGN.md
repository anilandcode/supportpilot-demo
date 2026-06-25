# SupportPilot Design System

## Product Positioning

SupportPilot is a workspace-first AI support product. The first screen for operators is the admin workspace, not a marketing flow: ticket triage, knowledge quality, approvals, analytics, and workspace setup are the primary jobs.

The public site and the admin console now intentionally use different visual strategies:

- Marketing is expressive, premium, and demo-led. The first viewport must make `SupportPilot` unmistakable, show a conversational input, show a cited answer, and show approval governance.
- Admin is quiet, dense, evidence-first, and built for repeated support work. It should look like an enterprise operations console, not an AI novelty surface.

## Modes

- Lite: embeddable chat, file-based retrieval, branded widget, and simple client setup.
- Enterprise: Supabase-backed workspaces, verified widget domains, RAG over approved docs, human approval, audit logs, and analytics.

## Interface Principles

- Dense, scannable admin surfaces for repeated support work.
- Cards only for repeated records, forms, and tool panels.
- Filters remain visible above high-volume lists.
- Risk, priority, status, and approval state use compact badges.
- AI output is never visually presented as final customer copy until a human approves or edits it.
- Source citations, confidence, rationale, and risk flags stay adjacent to draft actions.

## Navigation

Admin navigation:

- Overview
- Tickets
- Knowledge
- Approvals
- Analytics
- Settings

Customer navigation:

- Portal
- Embedded widget
- Iframe embed

## Visual System

- Locked direction: **warm editorial LynAI-style marketing + SupportPilot enterprise trust + restrained admin console**.
- Marketing is a separate public-site system: cream canvas, 1208px rail, hairline borders, IBM Plex Sans display type, Inter UI text, yellow CTAs, orange/periwinkle product graphics, a yellow support-flow canvas, and black enterprise/footer bands.
- Marketing must show the product workflow without obscuring it: dashboard, cited answer, source chips, confidence, approval queue, support-flow tabs, analytics board, pricing, FAQ, and a final widget CTA.
- Console uses a restrained Vercel/Linear/Stripe/shadcn-style operations surface: light canvas, compact tables, thin borders, dense metrics, and visible evidence near every AI action.
- Marketing tokens live in `app/globals.css` under `--m-*` and `.marketing-*` selectors. Enterprise/admin tokens remain intact for `/admin`, `/portal`, `/embed`, and widget surfaces.
- Primary enterprise accent remains indigo/violet `#6D56FF`, with workspace `brandColor` available for client-branded widgets and customer-facing surfaces.
- Semantic colors for status, risk, priority, approval, and confidence are protected tokens; tenant color overrides must not replace those meanings.
- Radius: 8px for editorial marketing controls and hairline product frames; 12-16px for enterprise admin cards and tables.
- Typography: marketing display uses IBM Plex Sans 400-600; admin H1 32, H2 24, H3 18, body 14, label 13, caption/metadata 12, mono 13. Text uses normal letter spacing.
- Icons: lucide icons for nav, status, upload, settings, snippets, domains, and approval controls.
- Semantic tokens drive status, priority, risk, confidence, and approval badges. Do not use ad hoc green/red/amber badge classes for new enterprise states.
- Dark mode variables must be preserved for admin and widget surfaces.

## Marketing Page Requirements

- The first viewport must state the literal offer: AI support with evidence, approvals, and a human fallback.
- The hero product dashboard must remain unobscured. Citation, approval, and confidence proof belongs inside the dashboard rather than as floating overlay cards.
- Required sections: announcement strip, sticky nav, centered hero, product dashboard, trust strip, evidence/approval/insight story rows, integrations rail, support-flow tabbed canvas, enterprise governance, analytics board, signal marquee, pricing, use cases/testimonial, FAQ, final CTA, and black grid footer.
- Stable anchors: `#product`, `#integrations`, `#support-flow`, `#security`, `#analytics`, `#pricing`, `#solutions`, `#docs`, and `#demo`.
- CTAs are `Book demo`, `Try widget`, and product route links. Demo CTAs use `theme.escalation.url`; product links keep `/admin`, `/portal`, `/embed`, `/admin/knowledge`, and `/admin/analytics` available.
- The site should not imply autonomous refunds, billing mutations, account changes, or unsupported compliance claims.
- Pricing is Launch `$49/mo`, Pro `$149/mo`, and Enterprise custom, with Pro highlighted for growing support teams.

## Semantic Status Rules

| Domain | State | Fill | Border | Text | Dot |
| --- | --- | --- | --- | --- | --- |
| Ticket | New | `#EEF2FF` | `#C7D2FE` | `#3730A3` | `#6366F1` |
| Ticket | In progress | `#EFF6FF` | `#BFDBFE` | `#1D4ED8` | `#3B82F6` |
| Ticket | Waiting / pending | `#FFFBEB` | `#FDE68A` | `#92400E` | `#F59E0B` |
| Ticket | Resolved | `#ECFDF5` | `#A7F3D0` | `#047857` | `#22C55E` |
| Ticket | Escalated / rejected | `#FEF2F2` | `#FECACA` | `#B91C1C` | `#EF4444` |
| Priority | Critical / urgent | `#FEF2F2` | `#FCA5A5` | `#991B1B` | `#DC2626` |
| Confidence | High | `#ECFDF5` | `#A7F3D0` | `#047857` | `#22C55E` |
| Confidence | Medium | `#FFFBEB` | `#FDE68A` | `#92400E` | `#F59E0B` |
| Confidence | Low | `#FEF2F2` | `#FECACA` | `#B91C1C` | `#EF4444` |

Use a visible dot or icon plus text for every badge. Tenant color overrides must not replace status/risk/confidence semantics.

## Admin Component Inventory

- Workspace health strip: launch readiness, checklist count, source count, verified domains, open approvals.
- Setup checklist: pinned until launch steps are complete.
- KPI cards: compact metrics with one line of context.
- Ticket inbox: filters and query-param saved views for approval, confidence, billing, unassigned, and stale knowledge.
- Dense ticket table: ID, customer, subject, intent, status, priority, AI confidence, sources, assignee, and last activity.
- Approval cards: exact risk reason, confidence meter, sources, editable draft path, destructive decision confirmation, and audit trail.
- Source drawer: approved chunks, score, source owner, and freshness.
- Knowledge screen: source status, ingestion status, freshness, chunk preview, source version, and missing-knowledge clusters.
- Analytics screen: deflection, acceptance, escalation, response time, confidence distribution, missing knowledge, and model route/cost tables.
- Settings hub: Workspace, Knowledge, Approval policies, Escalation routes, Members and roles, Branding, Domains, Security, Billing, live widget preview, and contrast validation.

## Widget States

The widget should support visible states for retrieving, drafting, cited answer, low confidence, approval pending, escalated, and feedback. Enterprise mode uses signed widget sessions when configured; Lite/demo mode keeps the unsigned local fallback.

## Workspace Settings

`/admin/settings` owns the client-specific setup:

- workspace and bot name
- brand color
- welcome message
- escalation email
- Calendly link
- widget key
- verified domains
- widget snippet
- approval policy summary

## Widget UX

The widget script reads `data-workspace`, fetches `/api/widget/config`, validates origin server-side, applies launcher color/label/position, and passes the workspace key into `/embed`.

Install snippet:

```html
<script async src="https://your-client-domain.example/widget.js" data-workspace="wk_demo_acmedesk"></script>
```

## Approval UX

Normal-risk AI drafts can be approved or edited by agents. High-risk drafts are routed to manager review. Escalation cues should include the exact risk reason, not a generic warning.

The confidence display is split into retrieval score, generation self-check, and policy risk. AI output is not final copy until a human approves or edits it.
