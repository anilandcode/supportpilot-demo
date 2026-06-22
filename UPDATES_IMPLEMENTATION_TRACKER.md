# SupportPilot Updates Implementation Tracker

Date: 2026-06-22

## P0 Implemented

- Semantic design tokens and status badges for ticket status, priority, approval, risk, domain, and confidence states.
- Marketing first viewport with SupportPilot-first positioning, conversational input, cited answer, and approval proof card.
- Workspace health strip, launch checklist, and setup state exposed through `/admin` and `GET /api/onboarding/state`.
- Approval queue redesign with risk reason, confidence breakdown, source drawer, draft body, and audit trail.
- Ticket AI panel with policy action, grounding status, source gap action, and confirmation before reject/escalate.
- Settings hub covering workspace, knowledge, approvals, escalation, members, branding, domains, security, and billing.
- Tenant-scoped migration for onboarding, model routes, security events, widget sessions, retention, tools, agent runs, policy evaluations, and grounding checks.
- Redacted prompt logging, prompt hashing, model-route logs, cost metrics, and optional signed widget sessions.

## P1 Implemented

- Query-param saved views for approval, low confidence, billing, unassigned, and stale-knowledge ticket slices.
- Missing-knowledge loop through negative feedback and explicit source-gap creation.
- Analytics cost/fallback metrics from AI run route metadata.
- Read-only tool registry scaffolding for `search_knowledge`, `get_ticket_history`, and `get_workspace_policy`.

## Deferred

- Full local small-model execution, local embeddings, and reranker runtime calls remain optional P2 experiments behind environment variables.
- SSO/SAML/SCIM, retention deletion jobs, SOC2 evidence packet automation, and external helpdesk sync remain roadmap items.
- Live Supabase RLS role verification requires a real Supabase project and credentials.

## Verification Commands

```bash
npm run typecheck
npm run test:enterprise
npm run build
git diff --check
graphify update .
```
