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

- Primary accent: indigo/violet by default, with workspace `brandColor` available for client-branded widgets and customer-facing surfaces.
- Secondary accent: pink is used only as a marketing highlight, never as the dominant admin color.
- Backgrounds: quiet neutral surfaces with clear borders.
- Radius: 8px for enterprise admin cards and tables unless an existing component requires a larger radius; marketing preview panels may use larger radii.
- Typography: admin H1 32, H2 24, H3 18, body 14, label 13, caption/metadata 12, mono 13.
- Icons: lucide icons for nav, status, upload, settings, snippets, domains, and approval controls.
- Semantic tokens drive status, priority, risk, confidence, and approval badges. Do not use ad hoc green/red/amber badge classes for new enterprise states.
- Dark mode variables must be preserved for admin and widget surfaces.

## Admin Component Inventory

- Workspace health strip: launch readiness, checklist count, source count, verified domains, open approvals.
- Setup checklist: pinned until launch steps are complete.
- KPI cards: compact metrics with one line of context.
- Ticket inbox: filters and query-param saved views for approval, confidence, billing, unassigned, and stale knowledge.
- Approval cards: exact risk reason, confidence meter, sources, editable draft path, destructive decision confirmation, and audit trail.
- Source drawer: approved chunks, score, source owner, and freshness.
- Settings hub: Workspace, Knowledge, Approval policies, Escalation routes, Members and roles, Branding, Domains, Security, Billing.

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
