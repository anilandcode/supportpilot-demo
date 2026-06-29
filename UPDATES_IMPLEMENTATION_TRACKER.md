# SupportPilot Updates Implementation Tracker

Date: 2026-06-24

## P0 Implemented

- Update docs `13` through `18` added and indexed in `README.md`.
- Locked LynAI-inspired marketing visuals, Agentra IA, and SupportPilot enterprise-trust design direction in `DESIGN.md`.
- Premium landing page rebuilt with dashboard hero, cited answer widget proof, approval/risk proof, stats, workflow, use cases, agentic features, live demo, security, integrations, analytics, Launch/Pro/Enterprise pricing, testimonials, FAQ, final CTA, and footer.
- Indigo-violet primary, pink secondary, amber marketing warmth, neutral console, dark proof-band, and semantic badge tokens expanded across `app/globals.css`, `theme.config.ts`, and `lib/theme.ts`.
- Explicit semantic badge primitive for ticket status, priority, risk, confidence, approval, and domain/security states.
- Admin shell updated with 248px sidebar, workspace switcher, verified-domain badge, search affordance, notification icon, and dense topbar.
- Ticket inbox converted to a table-first workflow with saved views, search, confidence, source count, assignee, and last activity columns.
- Approvals redesigned as a split queue/review workspace with queue reason, confidence meter, policy reason, source cards, audit trail, and sticky decision action bar.
- Knowledge page redesigned around source health, ingestion/freshness, selected source detail, chunk preview, and missing-knowledge clusters.
- Analytics page expanded with resolution funnel, confidence distribution, quality metrics, missing-knowledge clusters, and model route/cost table.
- Settings page now includes live widget preview and contrast/security status alongside snippets, domains, policies, retention, and billing placeholders.
- Widget citations expanded into source cards; chat widget now shows cited-answer and approval-pending banners.
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
- Billing page, optional Stripe customer portal handoff, current-period usage meters, model route cost grouping, and enforced Launch/Pro chat limits.

## Production Readiness Phase 1 Started

- Update docs `19` through `24` added and indexed in `README.md`.
- Added additive production auth migration `004_production_auth_onboarding.sql` for membership status, invitations, portal identities, onboarding sessions, role helper functions, and customer-owned RLS policies.
- Added shared permission rules for owner/admin/manager/agent route access, invite authorization, approval authorization, and legacy profile-role mapping.
- Updated `proxy.ts` to protect `/admin` with active workspace membership roles while keeping `/onboarding` available to authenticated first-run users.
- Added Supabase Auth pages for sign-up, magic link, forgot/reset password, portal login, and auth callback session exchange.
- Added `/onboarding` first-run workspace creation UI and `POST /api/onboarding/workspace`.
- Added invitation create/accept APIs plus `/invite/accept` UI with hashed, single-use invite-token flow.
- Added `npm run test:production` for route permission, invitation, onboarding, slug, token, and widget-key checks.

## Deferred

- Live Google Stitch/Figma exports are not required for the production code pass; prompt files remain committed as references.
- Full Stripe subscription lifecycle remains a follow-up: checkout, webhook reconciliation, invoice sync, and customer/price mapping beyond the optional portal session route.
- Full local small-model execution, local embeddings, and reranker runtime calls remain optional P2 experiments behind environment variables.
- SSO/SAML/SCIM, retention deletion jobs, SOC2 evidence packet automation, and external helpdesk sync remain roadmap items.
- Live Supabase RLS role verification requires a real Supabase project and credentials.

## Verification Commands

```bash
npm run typecheck
npm run test:enterprise
npm run test:production
npm run build
git diff --check
graphify update .
```
