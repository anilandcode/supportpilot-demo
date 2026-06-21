# SupportPilot Design System

## Product Positioning

SupportPilot is a workspace-first AI support product. The first screen for operators is the admin workspace, not a marketing flow: ticket triage, knowledge quality, approvals, analytics, and workspace setup are the primary jobs.

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

- Primary accent: workspace `brandColor`, default `#10b981`.
- Backgrounds: quiet neutral surfaces with clear borders.
- Radius: compact application radius; avoid oversized marketing cards in admin.
- Typography: small, readable labels; no hero-scale type inside dashboards.
- Icons: lucide icons for nav, status, upload, settings, snippets, domains, and approval controls.

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
